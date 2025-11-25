from rest_framework import serializers
from .models import Category, Product, ProductImage

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ('id', 'image', 'is_main')

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'category', 'category_name', 'name', 'description', 'price', 'stock', 'is_active', 'images', 'main_image', 'created_at')

    def get_main_image(self, obj):
        main_img = obj.images.filter(is_main=True).first()
        if main_img:
            return ProductImageSerializer(main_img, context=self.context).data
        first_img = obj.images.first()
        if first_img:
            return ProductImageSerializer(first_img, context=self.context).data
        return None
