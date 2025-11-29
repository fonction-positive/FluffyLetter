from django.contrib import admin
from .models import Address, Cart, CartItem, Order, OrderItem

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('recipient_name', 'user', 'phone', 'province', 'city', 'is_default', 'created_at')
    list_filter = ('is_default', 'province')
    search_fields = ('recipient_name', 'phone', 'user__username')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'updated_at')
    search_fields = ('user__username',)

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'subtotal', 'created_at')
    search_fields = ('cart__user__username', 'product__name')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'price', 'quantity', 'subtotal')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_no', 'user', 'total_amount', 'status', 'created_at', 'paid_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_no', 'user__username', 'shipping_name', 'shipping_phone')
    readonly_fields = ('order_no', 'created_at', 'paid_at', 'shipped_at', 'completed_at')
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('订单信息', {
            'fields': ('order_no', 'user', 'total_amount', 'status')
        }),
        ('收货信息', {
            'fields': ('shipping_name', 'shipping_phone', 'shipping_province', 
                      'shipping_city', 'shipping_district', 'shipping_address')
        }),
        ('物流信息', {
            'fields': ('tracking_no',)
        }),
        ('时间信息', {
            'fields': ('created_at', 'paid_at', 'shipped_at', 'completed_at')
        }),
    )
