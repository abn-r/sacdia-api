import requests
from bs4 import BeautifulSoup
import csv
import os
import urllib.parse
import re
import sys
import time
import unicodedata

def normalizar_texto(texto):
    # Normaliza el texto quitando acentos y convirtiendo ñ a n
    texto_sin_acentos = ''.join(
        c for c in unicodedata.normalize('NFD', texto)
        if unicodedata.category(c) != 'Mn'
    )
    return texto_sin_acentos.replace('ñ', 'n').replace('Ñ', 'N')

def limpiar_nombre_archivo(nombre):
    nombre_limpio = re.sub(r'[\\/*?:"<>|]', "", nombre)
    nombre_limpio = nombre_limpio.split('?')[0]
    nombre_limpio = normalizar_texto(nombre_limpio)
    return nombre_limpio

def descargar_archivo(url_base, url_relativa, nombre_archivo, ruta_descarga):
    url_completa = urllib.parse.urljoin(url_base, url_relativa)
    respuesta = requests.get(url_completa)
    if respuesta.status_code == 200:
        nombre_archivo_limpio = limpiar_nombre_archivo(nombre_archivo)
        ruta_completa = os.path.join(ruta_descarga, nombre_archivo_limpio)
        with open(ruta_completa, 'wb') as f:
            f.write(respuesta.content)
    else:
        print(f"Error al descargar {url_completa}")

def mostrar_progreso(total, actual):
    porcentaje = (actual / total) * 100
    barra = '=' * int(porcentaje / 2) + '>' + ' ' * (50 - int(porcentaje / 2))
    sys.stdout.write(f'\rProgreso: [{barra}] {porcentaje:.1f}%')
    sys.stdout.flush()

# Solicitar la ruta de descarga al usuario
ruta_descarga = input("Introduce la ruta donde quieres guardar los archivos descargados: ").strip()
if not ruta_descarga:
    ruta_descarga = 'descargas'  # Ruta por defecto si no se proporciona ninguna

# Crear el directorio si no existe
os.makedirs(ruta_descarga, exist_ok=True)

url = "https://www.guiasmayores.com/especialidades-ja---actividades-recreacionales.html"
url_base = "https://www.guiasmayores.com"
response = requests.get(url)
soup = BeautifulSoup(response.content, 'html.parser')

data = []
elementos = soup.find_all('td', class_='wsite-multicol-col')
total_elementos = len(elementos)

for index, td in enumerate(elementos, 1):
    div_imagen = td.find('div', class_='wsite-image')
    if div_imagen:
        nombre_div = div_imagen.find('div', style='display:block;font-size:90%')
        nombre = nombre_div.text.strip() if nombre_div else 'Sin nombre'
        
        img_tag = div_imagen.find('img')
        imagen_url = img_tag.get('src', '') if img_tag else ''
        imagen_nombre = os.path.basename(imagen_url) if imagen_url else 'sin_imagen.jpg'
        imagen_nombre = limpiar_nombre_archivo(imagen_nombre)
        
        a_tag = div_imagen.find('a')
        pdf_url = a_tag.get('href', '') if a_tag else ''
        pdf_nombre = os.path.basename(pdf_url) if pdf_url else 'sin_pdf.pdf'
        pdf_nombre = limpiar_nombre_archivo(pdf_nombre)
        
        if imagen_url:
            descargar_archivo(url_base, imagen_url, imagen_nombre, ruta_descarga)
        
        if pdf_url:
            descargar_archivo(url_base, pdf_url, pdf_nombre, ruta_descarga)
        
        data.append([nombre, imagen_nombre, pdf_nombre])
    
    mostrar_progreso(total_elementos, index)
    time.sleep(0.1)  # Pequeña pausa para no sobrecargar el servidor

print("\nDescarga completada. Generando CSV...")

# Generar el CSV en la misma ruta de descarga
ruta_csv = os.path.join(ruta_descarga, 'especialidades.csv')
with open(ruta_csv, 'w', newline='', encoding='utf-8-sig') as f:
    writer = csv.writer(f)
    writer.writerow(['Nombre', 'Imagen', 'PDF'])
    writer.writerows(data)

print(f"Proceso completado. Revisa el archivo '{ruta_csv}' y la carpeta '{ruta_descarga}'.")