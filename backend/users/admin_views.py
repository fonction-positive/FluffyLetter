from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Sum, Count
from orders.models import Order
from .serializers import UserSerializer

User = get_user_model()

class AdminUserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

    @action(detail=True, methods=['post'])
    def ban(self, request, pk=None):
        """封禁用户"""
        user = self.get_object()
        if user.is_superuser:
            return Response({'error': '不能封禁超级管理员'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.is_active = False
        user.save()
        return Response({'message': '用户已封禁'})

    @action(detail=True, methods=['post'])
    def unban(self, request, pk=None):
        """解封用户"""
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({'message': '用户已解封'})

class AdminStatsViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAdminUser]

    def list(self, request):
        """获取统计数据"""
        # 总销售额
        total_sales = Order.objects.filter(status__in=['paid', 'shipped', 'completed']).aggregate(
            total=Sum('total_amount')
        )['total'] or 0

        # 订单统计
        order_stats = {
            'total': Order.objects.count(),
            'pending': Order.objects.filter(status='pending').count(),
            'paid': Order.objects.filter(status='paid').count(),
            'shipped': Order.objects.filter(status='shipped').count(),
            'completed': Order.objects.filter(status='completed').count(),
            'cancelled': Order.objects.filter(status='cancelled').count(),
        }

        # 用户统计
        user_stats = {
            'total': User.objects.count(),
            'active': User.objects.filter(is_active=True).count(),
            'banned': User.objects.filter(is_active=False).count(),
        }

        # 最近订单
        recent_orders = Order.objects.all()[:10]
        from orders.serializers import OrderSerializer
        recent_orders_data = OrderSerializer(recent_orders, many=True).data

        return Response({
            'total_sales': float(total_sales),
            'order_stats': order_stats,
            'user_stats': user_stats,
            'recent_orders': recent_orders_data,
        })
