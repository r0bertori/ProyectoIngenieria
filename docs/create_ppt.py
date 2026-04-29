# Script para generar Project Briefing en PowerPoint
# Ejecutar: pip install python-pptx && python create_ppt.py

from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RgbColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import nsmap
from pptx.oxml import parse_xml

# Colores
VERDE = RgbColor(40, 167, 69)
AMARILLO = RgbColor(255, 193, 7)
NARANJA = RgbColor(253, 126, 20)
ROJO = RgbColor(220, 53, 69)
AZUL = RgbColor(0, 123, 255)
AZUL_OSCURO = RgbColor(52, 58, 64)
GRIS = RgbColor(108, 117, 125)
BLANCO = RgbColor(255, 255, 255)
NEGRO = RgbColor(0, 0, 0)

def add_title_slide(prs, title, subtitle):
    """Añade slide de título"""
    slide_layout = prs.slide_layouts[6]  # Blank
    slide = prs.slides.add_slide(slide_layout)

    # Fondo azul oscuro
    background = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.33), Inches(7.5))
    background.fill.solid()
    background.fill.fore_color.rgb = AZUL_OSCURO
    background.line.fill.background()

    # Título
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(2.5), Inches(12.33), Inches(1.5))
    tf = title_box.text_frame
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(44)
    p.font.bold = True
    p.font.color.rgb = BLANCO
    p.alignment = PP_ALIGN.CENTER

    # Subtítulo
    sub_box = slide.shapes.add_textbox(Inches(0.5), Inches(4.2), Inches(12.33), Inches(1))
    tf = sub_box.text_frame
    p = tf.paragraphs[0]
    p.text = subtitle
    p.font.size = Pt(24)
    p.font.color.rgb = RgbColor(200, 200, 200)
    p.alignment = PP_ALIGN.CENTER

    # Fecha
    date_box = slide.shapes.add_textbox(Inches(0.5), Inches(5.5), Inches(12.33), Inches(0.5))
    tf = date_box.text_frame
    p = tf.paragraphs[0]
    p.text = "Fecha: 15/04/2026 | Versión: v3.1 | Semana 9 de 11"
    p.font.size = Pt(16)
    p.font.color.rgb = RgbColor(150, 150, 150)
    p.alignment = PP_ALIGN.CENTER

    return slide

def add_indicator_box(slide, left, top, value, label, color, sublabel=""):
    """Añade una caja de indicador"""
    # Caja principal
    box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, Inches(2.8), Inches(1.8))
    box.fill.solid()
    box.fill.fore_color.rgb = color
    box.line.fill.background()

    # Valor
    value_box = slide.shapes.add_textbox(left, top + Inches(0.2), Inches(2.8), Inches(0.8))
    tf = value_box.text_frame
    p = tf.paragraphs[0]
    p.text = value
    p.font.size = Pt(36)
    p.font.bold = True
    p.font.color.rgb = BLANCO
    p.alignment = PP_ALIGN.CENTER

    # Label
    label_box = slide.shapes.add_textbox(left, top + Inches(0.9), Inches(2.8), Inches(0.4))
    tf = label_box.text_frame
    p = tf.paragraphs[0]
    p.text = label
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = BLANCO
    p.alignment = PP_ALIGN.CENTER

    # Sublabel
    if sublabel:
        sub_box = slide.shapes.add_textbox(left, top + Inches(1.3), Inches(2.8), Inches(0.4))
        tf = sub_box.text_frame
        p = tf.paragraphs[0]
        p.text = sublabel
        p.font.size = Pt(12)
        p.font.color.rgb = BLANCO
        p.alignment = PP_ALIGN.CENTER

def add_table(slide, left, top, width, height, data, headers):
    """Añade una tabla"""
    rows = len(data) + 1
    cols = len(headers)

    table = slide.shapes.add_table(rows, cols, left, top, width, height).table

    # Headers
    for i, header in enumerate(headers):
        cell = table.cell(0, i)
        cell.text = header
        cell.fill.solid()
        cell.fill.fore_color.rgb = AZUL_OSCURO
        p = cell.text_frame.paragraphs[0]
        p.font.size = Pt(12)
        p.font.bold = True
        p.font.color.rgb = BLANCO
        p.alignment = PP_ALIGN.CENTER

    # Data
    for row_idx, row_data in enumerate(data):
        for col_idx, cell_data in enumerate(row_data):
            cell = table.cell(row_idx + 1, col_idx)
            cell.text = str(cell_data)
            p = cell.text_frame.paragraphs[0]
            p.font.size = Pt(11)
            p.alignment = PP_ALIGN.CENTER

            # Color alternado
            if row_idx % 2 == 0:
                cell.fill.solid()
                cell.fill.fore_color.rgb = RgbColor(245, 245, 245)

    return table

def add_slide_header(slide, title):
    """Añade header a un slide"""
    # Barra superior
    bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.33), Inches(1))
    bar.fill.solid()
    bar.fill.fore_color.rgb = AZUL_OSCURO
    bar.line.fill.background()

    # Título
    title_box = slide.shapes.add_textbox(Inches(0.5), Inches(0.25), Inches(10), Inches(0.5))
    tf = title_box.text_frame
    p = tf.paragraphs[0]
    p.text = title
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = BLANCO

def create_slide1(prs):
    """Slide 1: Estado General del Proyecto"""
    slide_layout = prs.slide_layouts[6]  # Blank
    slide = prs.slides.add_slide(slide_layout)

    add_slide_header(slide, "Estado General del Proyecto")

    # Indicadores principales
    add_indicator_box(slide, Inches(1.5), Inches(1.3), "73%", "TIEMPOS", AMARILLO, "Semana 9 de 11")
    add_indicator_box(slide, Inches(5.25), Inches(1.3), "68%", "COSTES", VERDE, "4.430€ / 6.520€")
    add_indicator_box(slide, Inches(9), Inches(1.3), "65%", "ENTREGABLES", AMARILLO, "Backend 100%")

    # Tabla de entregables
    headers = ["Entregable", "Estado", "Progreso"]
    data = [
        ["v1.0 Backend API", "✓ ENTREGADO", "100%"],
        ["v2.0 Portal Tienda", "● EN CURSO", "80%"],
        ["v3.0 Backoffice", "⚠ RETRASADO", "20%"],
        ["v4.0 Integraciones", "✓ ENTREGADO", "100%"],
    ]
    add_table(slide, Inches(0.5), Inches(3.5), Inches(6), Inches(1.8), data, headers)

    # Gráfico Gantt simplificado (barras)
    gantt_title = slide.shapes.add_textbox(Inches(7), Inches(3.3), Inches(5.5), Inches(0.4))
    tf = gantt_title.text_frame
    p = tf.paragraphs[0]
    p.text = "Plan de Proyecto (11 semanas)"
    p.font.size = Pt(14)
    p.font.bold = True

    # Fases
    fases = [
        ("F0-F1 Requisitos", 0, 3, True),
        ("F2 Diseño", 3, 2, True),
        ("F3 Desarrollo", 5, 4, False),  # En curso
        ("F4-F5 QA/UAT", 9, 2, False),   # Pendiente
    ]

    y_start = Inches(3.8)
    for i, (nombre, start, duration, completed) in enumerate(fases):
        # Label
        label = slide.shapes.add_textbox(Inches(7), y_start + Inches(i * 0.45), Inches(1.8), Inches(0.35))
        tf = label.text_frame
        p = tf.paragraphs[0]
        p.text = nombre
        p.font.size = Pt(10)

        # Barra
        bar_left = Inches(8.8) + Inches(start * 0.35)
        bar_width = Inches(duration * 0.35)
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, bar_left, y_start + Inches(i * 0.45), bar_width, Inches(0.3))
        bar.fill.solid()
        bar.fill.fore_color.rgb = AZUL if completed else GRIS
        bar.line.fill.background()

    # Línea "HOY"
    hoy_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(11.7), Inches(3.7), Inches(0.03), Inches(2))
    hoy_line.fill.solid()
    hoy_line.fill.fore_color.rgb = ROJO
    hoy_line.line.fill.background()

    hoy_label = slide.shapes.add_textbox(Inches(11.4), Inches(5.7), Inches(1), Inches(0.3))
    tf = hoy_label.text_frame
    p = tf.paragraphs[0]
    p.text = "↑ HOY"
    p.font.size = Pt(10)
    p.font.color.rgb = ROJO
    p.font.bold = True

    # Footer
    footer = slide.shapes.add_textbox(Inches(0.5), Inches(7), Inches(12), Inches(0.3))
    tf = footer.text_frame
    p = tf.paragraphs[0]
    p.text = "Cosmetic Pipeline | Project Briefing | 15/04/2026"
    p.font.size = Pt(10)
    p.font.color.rgb = GRIS

def create_slide2(prs):
    """Slide 2: Costes y Progreso"""
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)

    add_slide_header(slide, "Estado de Costes y Progreso")

    # Tabla de costes (izquierda)
    cost_title = slide.shapes.add_textbox(Inches(0.5), Inches(1.2), Inches(6), Inches(0.4))
    tf = cost_title.text_frame
    p = tf.paragraphs[0]
    p.text = "Desglose de Costes"
    p.font.size = Pt(16)
    p.font.bold = True

    headers = ["Concepto", "Presupuesto", "Consumido", "%"]
    data = [
        ["Alcance Base", "3.500€", "2.450€", "70%"],
        ["Integración", "1.000€", "800€", "80%"],
        ["Reporting/APIs", "400€", "320€", "80%"],
        ["Infraestructura", "300€", "250€", "83%"],
        ["Formación", "400€", "200€", "50%"],
        ["Transporte/Reuniones", "400€", "300€", "75%"],
        ["Contingencia (10%)", "520€", "110€", "21%"],
        ["TOTAL", "6.520€", "4.430€", "68%"],
    ]
    add_table(slide, Inches(0.5), Inches(1.6), Inches(6), Inches(3.5), data, headers)

    # Gráfico de barras de horas (derecha)
    hours_title = slide.shapes.add_textbox(Inches(7), Inches(1.2), Inches(5.5), Inches(0.4))
    tf = hours_title.text_frame
    p = tf.paragraphs[0]
    p.text = "Horas por Área"
    p.font.size = Pt(16)
    p.font.bold = True

    # Barras de progreso
    areas = [
        ("Backend", 155, 160, 97),
        ("Frontend", 95, 160, 59),
        ("Diseño/UX", 35, 40, 88),
        ("QA/Testing", 10, 32, 31),
        ("Documentación", 12, 16, 75),
    ]

    y_pos = Inches(1.7)
    for nombre, actual, total, pct in areas:
        # Label
        label = slide.shapes.add_textbox(Inches(7), y_pos, Inches(1.5), Inches(0.4))
        tf = label.text_frame
        p = tf.paragraphs[0]
        p.text = nombre
        p.font.size = Pt(12)

        # Barra fondo (gris)
        bar_bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(8.5), y_pos + Inches(0.05), Inches(3.5), Inches(0.35))
        bar_bg.fill.solid()
        bar_bg.fill.fore_color.rgb = RgbColor(230, 230, 230)
        bar_bg.line.fill.background()

        # Barra progreso
        bar_width = Inches(3.5 * pct / 100)
        bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(8.5), y_pos + Inches(0.05), bar_width, Inches(0.35))
        bar.fill.solid()
        bar.fill.fore_color.rgb = AZUL
        bar.line.fill.background()

        # Porcentaje
        pct_label = slide.shapes.add_textbox(Inches(12.1), y_pos, Inches(0.7), Inches(0.4))
        tf = pct_label.text_frame
        p = tf.paragraphs[0]
        p.text = f"{pct}%"
        p.font.size = Pt(11)
        p.font.bold = True

        y_pos += Inches(0.5)

    # Total horas
    total_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7), Inches(4.5), Inches(5.8), Inches(0.8))
    total_box.fill.solid()
    total_box.fill.fore_color.rgb = AZUL_OSCURO
    total_box.line.fill.background()

    total_text = slide.shapes.add_textbox(Inches(7), Inches(4.6), Inches(5.8), Inches(0.6))
    tf = total_text.text_frame
    p = tf.paragraphs[0]
    p.text = "TOTAL: 307h de 408h consumidas (75%)"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = BLANCO
    p.alignment = PP_ALIGN.CENTER

    # Resumen inferior
    summary_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(5.5), Inches(12.3), Inches(1.3))
    summary_box.fill.solid()
    summary_box.fill.fore_color.rgb = RgbColor(240, 248, 255)
    summary_box.line.color.rgb = AZUL

    summary_text = slide.shapes.add_textbox(Inches(0.7), Inches(5.7), Inches(12), Inches(1))
    tf = summary_text.text_frame
    p = tf.paragraphs[0]
    p.text = "Resumen: Presupuesto dentro de lo planificado. Contingencia disponible: 410€ (79%)"
    p.font.size = Pt(14)
    p = tf.add_paragraph()
    p.text = "El consumo de horas está alineado con el avance del proyecto. Sin desviaciones significativas en costes."
    p.font.size = Pt(12)
    p.font.color.rgb = GRIS

def create_slide3(prs):
    """Slide 3: Desviaciones y Acciones"""
    slide_layout = prs.slide_layouts[6]
    slide = prs.slides.add_slide(slide_layout)

    add_slide_header(slide, "Análisis y Plan de Acción")

    # Desviaciones (izquierda)
    dev_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(1.3), Inches(6), Inches(2.2))
    dev_box.fill.solid()
    dev_box.fill.fore_color.rgb = RgbColor(255, 250, 240)
    dev_box.line.color.rgb = NARANJA

    dev_title = slide.shapes.add_textbox(Inches(0.7), Inches(1.4), Inches(5.5), Inches(0.4))
    tf = dev_title.text_frame
    p = tf.paragraphs[0]
    p.text = "⚠️ DESVIACIÓN EN TIEMPOS: +1 semana"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = NARANJA

    dev_content = slide.shapes.add_textbox(Inches(0.7), Inches(1.9), Inches(5.5), Inches(1.5))
    tf = dev_content.text_frame
    p = tf.paragraphs[0]
    p.text = "Causas:"
    p.font.size = Pt(12)
    p.font.bold = True

    causas = [
        "• Backoffice más complejo de lo estimado",
        "• 7 páginas de gestión pendientes",
        "• Configuración entorno Windows/WSL",
    ]
    for causa in causas:
        p = tf.add_paragraph()
        p.text = causa
        p.font.size = Pt(11)

    p = tf.add_paragraph()
    p.text = ""
    p = tf.add_paragraph()
    p.text = "✓ Flujo principal (Portal) 100% operativo"
    p.font.size = Pt(11)
    p.font.color.rgb = VERDE

    # Alternativas (derecha)
    alt_title = slide.shapes.add_textbox(Inches(6.8), Inches(1.2), Inches(6), Inches(0.4))
    tf = alt_title.text_frame
    p = tf.paragraphs[0]
    p.text = "Alternativas"
    p.font.size = Pt(16)
    p.font.bold = True

    headers = ["Opción", "Descripción", "Plazo", "Coste"]
    data = [
        ["A ✓", "MVP Reducido", "Sem 11", "6.520€"],
        ["B", "Entrega completa", "Sem 12-13", "+800€"],
        ["C", "Entrega actual", "Inmediato", "Sin cambio"],
    ]
    add_table(slide, Inches(6.8), Inches(1.6), Inches(5.8), Inches(1.3), data, headers)

    # Recomendación
    rec_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(3), Inches(5.8), Inches(0.5))
    rec_box.fill.solid()
    rec_box.fill.fore_color.rgb = VERDE
    rec_box.line.fill.background()

    rec_text = slide.shapes.add_textbox(Inches(6.8), Inches(3.05), Inches(5.8), Inches(0.4))
    tf = rec_text.text_frame
    p = tf.paragraphs[0]
    p.text = "✓ RECOMENDACIÓN: OPCIÓN A"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = BLANCO
    p.alignment = PP_ALIGN.CENTER

    # Acciones (inferior)
    actions_title = slide.shapes.add_textbox(Inches(0.5), Inches(3.7), Inches(12), Inches(0.4))
    tf = actions_title.text_frame
    p = tf.paragraphs[0]
    p.text = "Acciones Próximas 2 Semanas"
    p.font.size = Pt(16)
    p.font.bold = True

    headers = ["#", "Acción", "Responsable", "Fecha"]
    data = [
        ["1", "Completar página detalle de pedido", "Frontend", "Sem 10"],
        ["2", "Implementar gestión de pedidos (Backoffice)", "Frontend", "Sem 10"],
        ["3", "Testing del flujo completo", "QA", "Sem 10"],
        ["4", "Preparar demo para UAT", "PM", "Sem 10"],
        ["5", "Documentación de usuario final", "BA", "Sem 11"],
        ["6", "Despliegue en producción", "DevOps", "Sem 11"],
    ]
    add_table(slide, Inches(0.5), Inches(4.1), Inches(12.3), Inches(2.3), data, headers)

    # Decisión requerida
    decision_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.5), Inches(6.6), Inches(12.3), Inches(0.6))
    decision_box.fill.solid()
    decision_box.fill.fore_color.rgb = AZUL_OSCURO
    decision_box.line.fill.background()

    decision_text = slide.shapes.add_textbox(Inches(0.5), Inches(6.7), Inches(12.3), Inches(0.4))
    tf = decision_text.text_frame
    p = tf.paragraphs[0]
    p.text = "⚡ DECISIÓN REQUERIDA: Aprobar Opción A para cumplir plazos | Próxima revisión: Semana 10"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = BLANCO
    p.alignment = PP_ALIGN.CENTER

def main():
    # Crear presentación (16:9)
    prs = Presentation()
    prs.slide_width = Inches(13.33)
    prs.slide_height = Inches(7.5)

    # Crear slides
    add_title_slide(prs, "COSMETIC PIPELINE", "Project Briefing - Cuadro de Mandos")
    create_slide1(prs)
    create_slide2(prs)
    create_slide3(prs)

    # Guardar
    output_path = "Project_Briefing_Cosmetic_Pipeline.pptx"
    prs.save(output_path)
    print(f"✅ Presentación creada: {output_path}")
    print(f"   - 4 slides (Portada + 3 slides de contenido)")
    print(f"   - Formato 16:9")
    print(f"   - Listo para presentar")

if __name__ == "__main__":
    main()
