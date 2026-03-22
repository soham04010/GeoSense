from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, HRFlowable, Table, TableStyle
from reportlab.lib import colors
import os
import requests
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "data"))

def download_satellite_image(bbox, filepath):
    url = f"https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox={bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}&bboxSR=4326&size=800,500&imageSR=4326&format=png&f=image"
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
        aqi = payload.get("aqi", 0)
        lst = payload.get("lst", 0)
        ndvi = payload.get("ndvi", 0)
        
        risks = []
        if aqi > 100: risks.append(["High Particulate Matter", f"AQI: {aqi}", "CRITICAL", "Restricted outdoor activities & dust control."])
        elif aqi > 50: risks.append(["Moderate Air Quality", f"AQI: {aqi}", "WARNING", "Acceptable for public. Monitor hotspots."])
        else: risks.append(["Good Air Quality", f"AQI: {aqi}", "SAFE", "No immediate action required."])
        
        if lst > 42: risks.append(["Severe Urban Heat Island", f"LST: {lst}°C", "CRITICAL", "Deploy cooling infrastructure, mandate cool roofs."])
        elif lst > 38: risks.append(["Elevated Surface Temp", f"LST: {lst}°C", "WARNING", "Plant shade trees in open concrete areas."])
        else: risks.append(["Normal Surface Temp", f"LST: {lst}°C", "SAFE", "Maintain current canopy cover."])
        
        if ndvi < 0.2: risks.append(["Critical Lack of Vegetation", f"NDVI: {ndvi}", "CRITICAL", "Urgent afforestation and park development needed."])
        elif ndvi < 0.4: risks.append(["Sparse Vegetative Cover", f"NDVI: {ndvi}", "WARNING", "Increase roadside planting."])
        else: risks.append(["Healthy Vegetation Density", f"NDVI: {ndvi}", "SAFE", "Continue green preservation rules."])

        safe_ward = "".join([c if c.isalnum() else "_" for c in ward])
        output_pdf = os.path.join(DATA_DIR, f"{safe_ward}_Report.pdf")
        img_path = os.path.join(DATA_DIR, f"{safe_ward}_sat.png")
        has_image = download_satellite_image(bbox, img_path)

        doc = SimpleDocTemplate(output_pdf, pagesize=A4, leftMargin=12*mm, rightMargin=12*mm, topMargin=12*mm, bottomMargin=12*mm)
        styles = getSampleStyleSheet()

        # Styles: Lighter theme
        h_title = ParagraphStyle('HT', fontName='Helvetica-Bold', fontSize=18, textColor=colors.HexColor('#1e3a8a'), alignment=TA_CENTER)
        h_sub = ParagraphStyle('HS', fontName='Helvetica', fontSize=10, textColor=colors.HexColor('#64748b'), alignment=TA_CENTER)
        
        sec_title = ParagraphStyle('ST', fontName='Helvetica-Bold', fontSize=12, textColor=colors.HexColor('#0f172a'), spaceBefore=10, spaceAfter=8)
        body = ParagraphStyle('BD', fontName='Helvetica', fontSize=10, textColor=colors.HexColor('#334155'), leading=14)
        
        metric_label = ParagraphStyle('ML', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#475569'), alignment=TA_CENTER)

        story = []

        # 1. Light Header Table
        header_data = [
            [Paragraph("SATEYE URBAN INTELLIGENCE PLATFORM", h_title)],
            [Paragraph(f"MUNICIPAL WARD ACTION PLAN — {ward.upper()}, {city.upper()}", h_sub)]
        ]
        header_table = Table(header_data, colWidths=[186*mm])
        header_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 12),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        story.append(header_table)
        story.append(Spacer(1, 15))

        # 2. Hero Section: Image + Metric Blocks Side-by-Side
        def get_theme_colors(val, thresholds, inverse=False):
            # Returns (bg_color, text_color)
            if inverse:
                if val < thresholds[0]: return (colors.HexColor('#fee2e2'), colors.HexColor('#991b1b')) # Red
                if val < thresholds[1]: return (colors.HexColor('#fff7ed'), colors.HexColor('#c2410c')) # Orange
                return (colors.HexColor('#dcfce7'), colors.HexColor('#166534')) # Green
            else:
                if val > thresholds[1]: return (colors.HexColor('#fee2e2'), colors.HexColor('#991b1b')) # Red
                if val > thresholds[0]: return (colors.HexColor('#fff7ed'), colors.HexColor('#c2410c')) # Orange
                return (colors.HexColor('#dcfce7'), colors.HexColor('#166534')) # Green

        c_aqi_bg, c_aqi_text = get_theme_colors(aqi, [50, 100])
        c_lst_bg, c_lst_text = get_theme_colors(lst, [38, 42])
        c_ndv_bg, c_ndv_text = get_theme_colors(ndvi, [0.2, 0.4], True)

        def make_metric_box(label, val, unit, bg_color, text_color):
            ml = ParagraphStyle('MLBox', fontName='Helvetica-Bold', fontSize=8, textColor=text_color, alignment=TA_CENTER, spaceAfter=4)
            mv = ParagraphStyle('MVBox', fontName='Helvetica-Bold', fontSize=20, leading=22, textColor=text_color, alignment=TA_CENTER)
            d = [
                [Paragraph(label.upper(), ml)],
                [Paragraph(f"{val} <font size=9>{unit}</font>", mv)]
            ]
            t = Table(d, colWidths=[42*mm])
            t.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), bg_color),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 12),
                ('BOTTOMPADDING', (0,0), (-1,-1), 12),
                ('ROUNDEDCORNERS', [4, 4, 4, 4]),
                ('BOX', (0,0), (-1,-1), 0.5, text_color)
            ]))
            return t

        metrics_column = [
            [make_metric_box("PM2.5 AQI", aqi, "", c_aqi_bg, c_aqi_text)],
            [make_metric_box("SURFACE HEAT", lst, "°C", c_lst_bg, c_lst_text)],
            [make_metric_box("VEGETATION", ndvi, "idx", c_ndv_bg, c_ndv_text)]
        ]
        metrics_t = Table(metrics_column)
        metrics_t.setStyle(TableStyle([
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('TOPPADDING', (0,0), (-1,-1), 6),
        ]))

        if has_image:
            sat_img = Image(img_path, width=135*mm, height=95*mm)
            hero_data = [[sat_img, metrics_t]]
            hero_table = Table(hero_data, colWidths=[140*mm, 46*mm])
            hero_table.setStyle(TableStyle([
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('LEFTPADDING', (0,0), (-1,-1), 0),
                ('RIGHTPADDING', (0,0), (-1,-1), 0),
            ]))
            story.append(Paragraph("SATELLITE OBSERVATION: HIGH-RESOLUTION WARD SCAN", sec_title))
            story.append(hero_table)
            story.append(Spacer(1, 15))

        # 3. Formatted Action Plan Table
        story.append(Paragraph("AI-DRIVEN DIAGNOSIS & CIVIC ACTION PLAN", sec_title))
        
        table_style_BD = ParagraphStyle('TBD', fontName='Helvetica', fontSize=9, textColor=colors.HexColor('#334155'))
        table_style_BDBold = ParagraphStyle('TBDB', fontName='Helvetica-Bold', fontSize=9, textColor=colors.HexColor('#0f172a'))
        
        action_data = [["Threat Sector", "Observed", "Status", "Urban Planning Directive"]]
        for r in risks:
            p_threat = Paragraph(r[0], table_style_BDBold)
            p_obs = Paragraph(r[1], table_style_BD)
            
            status_color = colors.HexColor('#10b981') if r[2] == 'SAFE' else colors.HexColor('#f59e0b') if r[2] == 'WARNING' else colors.HexColor('#ef4444')
            p_status = Paragraph(f"<font color={status_color.hexval()}>{r[2]}</font>", table_style_BDBold)
            p_dir = Paragraph(r[3], table_style_BD)
            action_data.append([p_threat, p_obs, p_status, p_dir])

        action_table = Table(action_data, colWidths=[40*mm, 25*mm, 25*mm, 96*mm])
        action_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f8fafc')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#64748b')),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 8),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        
        story.append(action_table)
        story.append(Spacer(1, 25))

        # 4. Footer
        foot = ParagraphStyle('FT', fontName='Helvetica', fontSize=8, textColor=colors.HexColor('#94a3b8'), alignment=TA_CENTER)
        story.append(Paragraph("Generated by SatEye Intelligence Engine • Harmonized Earth Observation Data (MODIS/Sentinel) • For Official Civic Decision-Making", foot))

        doc.build(story)
        
        if has_image and os.path.exists(img_path):
            os.remove(img_path)

        return {"status": "success", "file_path": output_pdf, "ward": ward}

    except Exception as e:
        return {"status": "error", "message": str(e)}
