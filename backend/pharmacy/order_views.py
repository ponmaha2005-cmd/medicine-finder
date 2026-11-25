from django.db import transaction
from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Order, OrderItem, Stock

STEPS = ["Placed", "Packed", "Out for Delivery", "Delivered"]


def current_step(order):
    # Demo tracking: moves to the next step every 1 minute
    minutes = (timezone.now() - order.created_at).total_seconds() / 60
    return min(int(minutes), len(STEPS) - 1)


def order_data(order):
    return {
        'id': order.id,
        'created_at': timezone.localtime(order.created_at).strftime('%d %b %Y, %I:%M %p'),
        'customer': order.user.first_name,
        'email': order.user.email,
        'address': order.address,
        'total': float(order.total),
        'step': current_step(order),
        'steps': STEPS,
        'items': [
            {
                'medicine': i.medicine,
                'shop': i.shop,
                'price': float(i.price),
                'quantity': i.quantity,
            }
            for i in order.items.all()
        ],
    }


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def place_order(request):
    items = request.data.get('items', [])
    address = request.data.get('address', '').strip()
    if not items or not address:
        return Response({'error': 'Cart and delivery address are required'}, status=400)

    lines = []
    for it in items:
        try:
            qty = max(1, int(it.get('quantity', 1)))
        except (TypeError, ValueError):
            qty = 1
        stock = (
            Stock.objects.select_related('medicine', 'shop')
            .filter(medicine__name=it.get('medicine'), shop__name=it.get('shop'))
            .first()
        )
        if not stock or stock.quantity < qty:
            return Response(
                {'error': f"{it.get('medicine')} is not available at {it.get('shop')}"},
                status=400,
            )
        lines.append((stock, qty))

    with transaction.atomic():
        order = Order.objects.create(user=request.user, address=address)
        total = 0
        for stock, qty in lines:
            OrderItem.objects.create(
                order=order,
                medicine=stock.medicine.name,
                shop=stock.shop.name,
                price=stock.price,
                quantity=qty,
            )
            stock.quantity -= qty
            stock.save()
            total += stock.price * qty
        order.total = total
        order.save()

    return Response(order_data(order))


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = (
        Order.objects.filter(user=request.user)
        .prefetch_related('items')
        .order_by('-created_at')
    )
    return Response([order_data(o) for o in orders])