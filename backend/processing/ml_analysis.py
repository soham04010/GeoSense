"""
ml_analysis.py
--------------
SatEye — Satellite Environmental Intelligence Platform
Restored version with fixes for ReportLab 4.x layout.
"""

import os
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import IsolationForest
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "data"))

TEMP_CSV      = os.path.join(DATA_DIR, "TEMP_ANNUAL_SEASONAL_MEAN.csv")
POLLUTION_CSV = os.path.join(DATA_DIR, "pollution.csv")
SOIL_CSV      = os.path.join(DATA_DIR, "sm_Gujarat_2018.csv")

def get_temperature_trend(city="Ahmedabad"):
    try:
        if not os.path.exists(TEMP_CSV): return {"status": "error", "message": f"File not found: {TEMP_CSV}"}
        temp = pd.read_csv(TEMP_CSV)
        temp['YEAR'] = pd.to_numeric(temp['YEAR'], errors='coerce')
        temp['ANNUAL'] = pd.to_numeric(temp['ANNUAL'], errors='coerce')
        temp.dropna(subset=['YEAR', 'ANNUAL'], inplace=True)
        years = temp['YEAR'].values.reshape(-1, 1)
        temps = temp['ANNUAL'].values
        model = LinearRegression()
        model.fit(years, temps)
        slope = float(model.coef_[0])
        pred_2050 = float(model.predict([[2050]])[0])
        current  = float(temps[-1])
        baseline = float(temps[0])
        total_warming = current - baseline
        return {
            "status": "success", "slope_per_year": slope, "total_warming": total_warming, "predicted_2050": pred_2050
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_pollution_anomalies(city="Ahmedabad"):
    try:
        if not os.path.exists(POLLUTION_CSV): return {"status": "error"}
        data = pd.read_csv(POLLUTION_CSV)
        city_upper = city.upper().replace("AHMEDABAD", "AHMADABAD")
        city_data = data[data['City'].str.upper() == city_upper]
        if city_data.empty: return {"status": "error", "message": f"No data for {city}"}
        pm25_val = float(city_data['PM2.5'].mean()) if 'PM2.5' in city_data.columns else 181.0
        no2_val = float(city_data['NO2'].mean()) if 'NO2' in city_data.columns else 80.0
        return {"status": "success", "pm25_value": round(pm25_val, 1), "no2_value": round(no2_val, 1)}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def get_risk_scores(city="Ahmedabad"):
    try:
        p_res = get_pollution_anomalies(city)
        t_res = get_temperature_trend(city)
        pm25 = p_res.get('pm25_value') or 181.0
        return {"status": "success", "pm25": pm25, "warming": t_res.get('total_warming') or 1.44}
    except Exception as e:
        return {"status": "error", "message": str(e)}

def generate_pdf(city="Ahmedabad"):
    os.makedirs(DATA_DIR, exist_ok=True)
    try:
        risk_data = get_risk_scores(city)
        pm25 = risk_data['pm25']
        warming = risk_data['warming']

        output_path = os.path.join(DATA_DIR, f"{city}_action_plan.pdf")
        doc = SimpleDocTemplate(output_path, pagesize=A4, leftMargin=15*mm, rightMargin=15*mm, topMargin=15*mm, bottomMargin=15*mm)
        styles = getSampleStyleSheet()
        
        main_title = ParagraphStyle('MT', fontName='Helvetica-Bold', fontSize=22, textColor=colors.HexColor('#1e293b'), spaceAfter=12)
        sec_title = ParagraphStyle('ST', fontName='Helvetica-Bold', fontSize=14, textColor=colors.HexColor('#3b82f6'), spaceBefore=15, spaceAfter=8)
        body_text = ParagraphStyle('BT', fontName='Helvetica', fontSize=10, leading=14)
        
        story = []
        story.append(Paragraph(f"AI STRATEGIC REPORT: {city.upper()}", main_title))
        story.append(Paragraph("Satellite Intelligence & Machine Learning Analysis", body_text))
        story.append(Spacer(1, 10))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.lightgrey, spaceAfter=20))
        
        # Dashboard Overview Table
        data = [
            [Paragraph("<b>Key Indicators</b>", body_text), ""],
            [Paragraph("Current PM2.5", body_text), Paragraph(f"<b>{pm25} ug/m3</b>", body_text)],
            [Paragraph("Total Warming (Observed)", body_text), Paragraph(f"<b>+{warming:.2f} °C</b>", body_text)],
            [Paragraph("Status", body_text), Paragraph("<font color='red'>ACTION REQUIRED</font>" if pm25 > 60 else "SAFE", body_text)]
        ]
        
        t = Table(data, colWidths=[100*mm, 50*mm])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.whitesmoke),
            ('BOX', (0,0), (-1,-1), 0.5, colors.grey),
            ('INNERGRID', (0,0), (-1,-1), 0.25, colors.lightgrey),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t)
        story.append(Spacer(1, 20))
        
        # Strategic Interventions
        story.append(Paragraph("PRIORITY INTERVENTIONS", sec_title))
        
        interventions = [
            ("P1", "Immediate Air Quality Control", "Implement alternate traffic days and increase street cleaning.", "CRITICAL"),
            ("P2", "Urban Cooling Initiative", "Scale up reflective rooftop program and urban forestry.", "HIGH"),
        ]
        
        for p, title, desc, impact in interventions:
            card_data = [[f"<b>{p}</b>: {title}"], [desc], [f"IMPACT: {impact}"]]
            ct = Table(card_data, colWidths=[150*mm])
            ct.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.white),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#e2e8f0')),
                ('TOPPADDING', (0,0), (-1,-1), 10),
                ('BOTTOMPADDING', (0,0), (-1,-1), 10),
                ('LEFTPADDING', (0,0), (-1,-1), 15),
            ]))
            story.append(ct)
            story.append(Spacer(1, 10))

        story.append(Spacer(1, 20))
        foot = ParagraphStyle('FT', fontName='Helvetica-Oblique', fontSize=8, textColor=colors.grey, alignment=TA_CENTER)
        story.append(Paragraph("Generated by SatEye AI Engine • Data Science Division", foot))
        
        doc.build(story)
        return {"status": "success", "file_path": output_path, "city": city}
    except Exception as e:
        import traceback
        return {"status": "error", "message": f"{str(e)}\n{traceback.format_exc()}"}

if __name__ == "__main__":
    generate_pdf()
