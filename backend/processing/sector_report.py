from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib import colors
import os
import requests
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "data"))


def download_satellite_image(bbox, filepath):
    url = (
        f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export"
        f"?bbox={bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
        f"&bboxSR=4326&size=800,500&imageSR=4326&format=png&f=image"
    )
    try:
        r = requests.get(url, timeout=10)
        if r.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(r.content)
            return True
    except Exception as e:
        print(f"Failed to download satellite image: {e}")
    return False


def generate_sector_pdf(payload: dict):
    try:
        city = payload.get("city", "Unknown")
        ward = payload.get("ward", "Sector")
        bbox = payload.get("bbox", [72.5, 23.0, 72.6, 23.1])
        aqi  = payload.get("aqi", 0)
        lst  = payload.get("lst", 0)
        ndvi = payload.get("ndvi", 0)

        # ── Risk assessment ────────────────────────────────────────────
        risks = []
        if aqi > 100:   risks.append(["High Particulate Matter",     f"AQI: {aqi}",    "CRITICAL", "Restrict outdoor activities and enforce dust control measures."])
        elif aqi > 50:  risks.append(["Moderate Air Quality",         f"AQI: {aqi}",    "WARNING",  "Acceptable for general public. Monitor high-exposure hotspots."])
        else:           risks.append(["Good Air Quality",              f"AQI: {aqi}",    "SAFE",     "No immediate action required. Continue routine monitoring."])

        if lst > 42:    risks.append(["Severe Urban Heat Island",     f"LST: {lst} C",  "CRITICAL", "Deploy cooling infrastructure; mandate cool-roof installations."])
        elif lst > 38:  risks.append(["Elevated Surface Temperature",  f"LST: {lst} C",  "WARNING",  "Plant shade trees in open concrete and paved areas."])
        else:           risks.append(["Normal Surface Temperature",    f"LST: {lst} C",  "SAFE",     "Maintain current canopy cover and green buffer zones."])

        if ndvi < 0.2:  risks.append(["Critical Vegetation Deficit",  f"NDVI: {ndvi}",  "CRITICAL", "Urgent afforestation and public park development required."])
        elif ndvi < 0.4:risks.append(["Sparse Vegetative Cover",       f"NDVI: {ndvi}",  "WARNING",  "Increase roadside and median planting programmes."])
        else:           risks.append(["Healthy Vegetation Density",    f"NDVI: {ndvi}",  "SAFE",     "Continue green-space preservation and maintenance rules."])

        from datetime import date
        report_date = date.today().strftime("%d %B %Y")

        safe_ward  = "".join([c if c.isalnum() else "_" for c in ward])
        output_pdf = os.path.join(DATA_DIR, f"{safe_ward}_Report.pdf")
        img_path   = os.path.join(DATA_DIR, f"{safe_ward}_sat.png")
        has_image  = download_satellite_image(bbox, img_path)

        # ── Palette (light theme) ──────────────────────────────────────
        C_WHITE     = colors.white
        C_BRAND     = colors.HexColor('#0F4C81')
        C_ACCENT    = colors.HexColor('#00A878')
        C_BORDER    = colors.HexColor('#E2E8F0')
        C_TEXT      = colors.HexColor('#1E293B')
        C_MUTED     = colors.HexColor('#64748B')

        C_CRIT_T    = colors.HexColor('#DC2626')
        C_CRIT_BG   = colors.HexColor('#FEF2F2')
        C_CRIT_BD   = colors.HexColor('#FECACA')
        C_WARN_T    = colors.HexColor('#D97706')
        C_WARN_BG   = colors.HexColor('#FFFBEB')
        C_WARN_BD   = colors.HexColor('#FDE68A')
        C_SAFE_T    = colors.HexColor('#059669')
        C_SAFE_BG   = colors.HexColor('#ECFDF5')
        C_SAFE_BD   = colors.HexColor('#A7F3D0')

        W = A4[0] - 28*mm

        doc = SimpleDocTemplate(
            output_pdf, pagesize=A4,
            leftMargin=14*mm, rightMargin=14*mm,
            topMargin=12*mm, bottomMargin=12*mm,
        )

        story = []

        # ── 1. HEADER ──────────────────────────────────────────────────
        def ps(name, font='Helvetica', size=10, color=None, align=TA_LEFT, leading=None, **kw):
            return ParagraphStyle(
                name, fontName=font, fontSize=size,
                textColor=color or C_TEXT,
                alignment=align,
                leading=leading or (size * 1.4),
                **kw,
            )

        hdr = Table([
            [
                Paragraph(f'<b>{city.upper()}</b>',
                          ps('hc', 'Helvetica-Bold', 20, colors.white)),
                Paragraph(report_date,
                          ps('hd', size=9, color=colors.HexColor('#93C5FD'), align=TA_RIGHT)),
            ],
            [
                Paragraph(f'Municipal Ward Report  |  {ward}',
                          ps('hs', size=9.5, color=colors.HexColor('#BFDBFE'))),
                Paragraph('GeoSense Sector Intelligence',
                          ps('hg', size=8, color=colors.HexColor('#7EA9CB'), align=TA_RIGHT)),
            ],
        ], colWidths=[W * 0.65, W * 0.35])
        hdr.setStyle(TableStyle([
            ('BACKGROUND',    (0, 0), (-1, -1), C_BRAND),
            ('TOPPADDING',    (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('LEFTPADDING',   (0, 0), (-1, -1), 14),
            ('RIGHTPADDING',  (0, 0), (-1, -1), 14),
            ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(hdr)

        # Accent strip
        strip_wrap = Table([[Table([['']], colWidths=[W + 28*mm], rowHeights=[3])]], colWidths=[W])
        strip_wrap.setStyle(TableStyle([('LEFTPADDING',(0,0),(-1,-1),-14*mm),('RIGHTPADDING',(0,0),(-1,-1),-14*mm),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0)]))
        inner_strip = strip_wrap._cellvalues[0][0]
        inner_strip.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),C_ACCENT),('TOPPADDING',(0,0),(-1,-1),0),('BOTTOMPADDING',(0,0),(-1,-1),0),('LEFTPADDING',(0,0),(-1,-1),0),('RIGHTPADDING',(0,0),(-1,-1),0)]))
        story.append(strip_wrap)
        story.append(Spacer(1, 8*mm))

        # ── 2. METRIC CARDS ─────────────────────────────────────────────
        def mc_colors(val, warn, crit, inverse=False):
            if inverse:
                if val < crit: return C_CRIT_T, C_CRIT_BG, C_CRIT_BD, 'CRITICAL'
                if val < warn: return C_WARN_T, C_WARN_BG, C_WARN_BD, 'WARNING'
                return C_SAFE_T, C_SAFE_BG, C_SAFE_BD, 'SAFE'
            else:
                if val > crit: return C_CRIT_T, C_CRIT_BG, C_CRIT_BD, 'CRITICAL'
                if val > warn: return C_WARN_T, C_WARN_BG, C_WARN_BD, 'WARNING'
                return C_SAFE_T, C_SAFE_BG, C_SAFE_BD, 'SAFE'

        aqi_tc, aqi_bg, aqi_bd, aqi_lbl = mc_colors(aqi,  50,  100)
        lst_tc, lst_bg, lst_bd, lst_lbl = mc_colors(lst,  38,   42)
        ndv_tc, ndv_bg, ndv_bd, ndv_lbl = mc_colors(ndvi, 0.4, 0.2, True)

        CARD_W = (W - 4*mm) / 3

        def metric_card(label, value, unit, tc, bg, bd, status):
            t = Table([
                [Paragraph(label, ps(f'ml{label}', 'Helvetica-Bold', 7.5, C_MUTED, TA_CENTER))],
                [Paragraph(f'<b>{value}</b>',
                           ps(f'mv{label}', 'Helvetica-Bold', 22, tc, TA_CENTER, leading=26))],
                [Paragraph(unit, ps(f'mu{label}', size=7.5, color=C_MUTED, align=TA_CENTER))],
                [Paragraph(f'<b>{status}</b>',
                           ps(f'ms{label}', 'Helvetica-Bold', 7.5, tc, TA_CENTER))],
            ], colWidths=[CARD_W])
            t.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, -1), bg),
                ('BOX',           (0, 0), (-1, -1), 1, bd),
                ('TOPPADDING',    (0, 0), (-1, -1), 10),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ]))
            return t

        metrics_row = Table([[
            metric_card('AQI',          str(aqi),   'air quality index', aqi_tc, aqi_bg, aqi_bd, aqi_lbl),
            metric_card('SURFACE TEMP', f'{lst} C', 'land surface',      lst_tc, lst_bg, lst_bd, lst_lbl),
            metric_card('NDVI',         str(ndvi),  'vegetation index',  ndv_tc, ndv_bg, ndv_bd, ndv_lbl),
        ]], colWidths=[CARD_W + 2*mm] * 3)
        metrics_row.setStyle(TableStyle([
            ('LEFTPADDING',   (0, 0), (-1, -1), 1),
            ('RIGHTPADDING',  (0, 0), (-1, -1), 1),
            ('TOPPADDING',    (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(metrics_row)
        story.append(Spacer(1, 6*mm))

        # ── 3. SATELLITE IMAGE ──────────────────────────────────────────
        def section_hdr(text):
            t = Table([[Paragraph(text, ps('sh'+text[:3], 'Helvetica-Bold', 10, C_BRAND))]],
                      colWidths=[W])
            t.setStyle(TableStyle([
                ('BACKGROUND',    (0, 0), (-1, -1), colors.HexColor('#EFF6FF')),
                ('TOPPADDING',    (0, 0), (-1, -1), 7),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
                ('LEFTPADDING',   (0, 0), (-1, -1), 10),
                ('LINEBELOW',     (0, 0), (-1, 0),  1.5, C_ACCENT),
                ('LINEABOVE',     (0, 0), (-1, 0),  0.5, C_BORDER),
            ]))
            return t

        if has_image:
            story.append(section_hdr('SATELLITE OBSERVATION — HIGH-RESOLUTION WARD SCAN'))
            story.append(Spacer(1, 4*mm))
            sat_img = Image(img_path, width=W, height=int(W * 0.55))
            story.append(sat_img)
            story.append(Spacer(1, 6*mm))

        # ── 4. ACTION PLAN TABLE ────────────────────────────────────────
        story.append(section_hdr('AI-DRIVEN DIAGNOSIS & CIVIC ACTION PLAN'))
        story.append(Spacer(1, 5*mm))

        th_s = ps('th', 'Helvetica-Bold', 8, C_MUTED, TA_LEFT)
        td_b = ps('tdb', 'Helvetica-Bold', 9, C_TEXT)
        td_o = ps('tdo', size=8.5, color=C_MUTED, leading=13)

        action_data = [[Paragraph('Threat Sector', th_s), Paragraph('Observed', th_s),
                        Paragraph('Status', th_s),         Paragraph('Urban Planning Directive', th_s)]]

        for row in risks:
            sc = C_CRIT_T if row[2] == 'CRITICAL' else C_WARN_T if row[2] == 'WARNING' else C_SAFE_T
            action_data.append([
                Paragraph(row[0], td_b),
                Paragraph(row[1], ps(f'ob{row[0][:4]}', size=8.5, color=C_TEXT, align=TA_CENTER)),
                Paragraph(f'<b>{row[2]}</b>', ps(f'st{row[0][:4]}', 'Helvetica-Bold', 8, sc, TA_CENTER)),
                Paragraph(row[3], td_o),
            ])

        action_table = Table(action_data, colWidths=[48*mm, 22*mm, 22*mm, W - 92*mm])
        action_table.setStyle(TableStyle([
            ('BACKGROUND',     (0, 0),  (-1, 0),  colors.HexColor('#F1F5F9')),
            ('TOPPADDING',     (0, 0),  (-1, 0),  7),
            ('BOTTOMPADDING',  (0, 0),  (-1, 0),  7),
            ('ROWBACKGROUNDS', (0, 1),  (-1, -1), [C_WHITE, colors.HexColor('#F8FAFC')]),
            ('TOPPADDING',     (0, 1),  (-1, -1), 9),
            ('BOTTOMPADDING',  (0, 1),  (-1, -1), 9),
            ('ALIGN',          (0, 0),  (-1, -1), 'LEFT'),
            ('VALIGN',         (0, 0),  (-1, -1), 'MIDDLE'),
            ('LEFTPADDING',    (0, 0),  (-1, -1), 7),
            ('RIGHTPADDING',   (0, 0),  (-1, -1), 7),
            ('LINEBELOW',      (0, 0),  (-1, -1), 0.5, C_BORDER),
            ('BOX',            (0, 0),  (-1, -1), 0.5, C_BORDER),
        ]))
        story.append(action_table)
        story.append(Spacer(1, 10*mm))

        # ── 5. FOOTER ───────────────────────────────────────────────────
        footer = Table([[
            Paragraph(f'GeoSense Intelligence Engine  |  {ward}, {city}  |  {report_date}',
                      ps('fl', 'Helvetica-Bold', 7.5, C_BRAND)),
            Paragraph('Data: MODIS / Sentinel / ArcGIS  |  For Official Civic Use Only',
                      ps('fr', size=7.5, color=C_MUTED, align=TA_RIGHT)),
        ]], colWidths=[W / 2, W / 2])
        footer.setStyle(TableStyle([
            ('TOPPADDING',    (0, 0), (-1, -1), 7),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
            ('LINEABOVE',     (0, 0), (-1, -1), 1, C_BORDER),
            ('VALIGN',        (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(footer)

        doc.build(story)

        if has_image and os.path.exists(img_path):
            os.remove(img_path)

        return {"status": "success", "file_path": output_pdf, "ward": ward}

    except Exception as e:
        return {"status": "error", "message": str(e)}
