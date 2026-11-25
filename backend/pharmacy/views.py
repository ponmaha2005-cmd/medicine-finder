from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Stock
import difflib
import re
import pytesseract
from PIL import Image
from .models import Medicine

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

@api_view(['GET'])
def search_medicine(request):
    query = request.GET.get('q', '').strip()
    if not query:
        return Response({'error': 'Please enter a medicine name'}, status=400)

    stocks = (
        Stock.objects
        .filter(medicine__name__icontains=query)
        .select_related('shop', 'medicine')
        .order_by('price')
    )

    results = [
        {
            'medicine': s.medicine.name,
            'generic': s.medicine.generic_name,
            'shop': s.shop.name,
            'area': s.shop.area,
            'price': float(s.price),
            'quantity': s.quantity,
            'in_stock': s.quantity > 0,
        }
        for s in stocks
    ]
    return Response(results)

@api_view(['POST'])
def scan_prescription(request):
    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'Please upload a prescription image'}, status=400)

    text = pytesseract.image_to_string(Image.open(image))
    words = re.findall(r'[a-zA-Z]{4,}', text.lower())

    found = []
    for med in Medicine.objects.all():
        key = med.name.split()[0].lower()
        if difflib.get_close_matches(key, words, n=1, cutoff=0.8):
            found.append(med)

    results = []
    for med in found:
        stocks = (
            Stock.objects.filter(medicine=med, quantity__gt=0)
            .select_related('shop')
            .order_by('price')
        )
        results.append({
            'medicine': med.name,
            'generic': med.generic_name,
            'shops': [
                {'shop': s.shop.name, 'area': s.shop.area, 'price': float(s.price)}
                for s in stocks
            ],
        })

    return Response({'text_read': text, 'medicines': results})