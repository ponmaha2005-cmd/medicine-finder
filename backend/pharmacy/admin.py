from django.contrib import admin
from .models import Medicine, Shop, Stock, Order, OrderItem

admin.site.register(Medicine)
admin.site.register(Shop)
admin.site.register(Stock)
admin.site.register(Order)
admin.site.register(OrderItem)