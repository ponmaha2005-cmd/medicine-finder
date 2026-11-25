import os
import random
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from pharmacy.models import Medicine, Shop, Stock

medicines = [
    ("Paracetamol 500", "Paracetamol", 20),
    ("Dolo 650", "Paracetamol", 32),
    ("Crocin", "Paracetamol", 30),
    ("Azithromycin 500", "Azithromycin", 120),
    ("Amoxicillin 500", "Amoxicillin", 90),
    ("Cetirizine 10", "Cetirizine", 25),
    ("Pantoprazole 40", "Pantoprazole", 85),
    ("Metformin 500", "Metformin", 30),
    ("Amlodipine 5", "Amlodipine", 40),
    ("Ibuprofen 400", "Ibuprofen", 28),
    ("Vitamin C 500", "Ascorbic Acid", 45),
    ("ORS Powder", "Oral Rehydration Salts", 22),
]

shops = [
    ("Apollo Pharmacy", "Thanjavur"),
    ("MedPlus", "Trichy"),
    ("Sri Murugan Medicals", "Thanjavur"),
    ("City Care Pharmacy", "Coimbatore"),
]

shop_objs = []
for name, area in shops:
    shop, _ = Shop.objects.get_or_create(name=name, area=area)
    shop_objs.append(shop)

for name, generic, base_price in medicines:
    med, _ = Medicine.objects.get_or_create(name=name, generic_name=generic)
    for shop in shop_objs:
        price = round(base_price * random.uniform(0.9, 1.15), 2)
        Stock.objects.update_or_create(
            shop=shop,
            medicine=med,
            defaults={"price": price, "quantity": random.randint(0, 50)},
        )

print("Sample data added!")