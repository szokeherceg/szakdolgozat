from django.contrib import admin
from .models import User, HorseData, UserHorse

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'lang', 'date_joined', 'is_active', 'is_staff')
    search_fields = ('email', 'name')
    list_filter = ('lang', 'is_active', 'is_staff')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined',)

@admin.register(HorseData)
class HorseDataAdmin(admin.ModelAdmin):
    list_display = ('name', 'weight', 'age')
    search_fields = ('name',)
    list_filter = ('age',)

@admin.register(UserHorse)
class UserHorseAdmin(admin.ModelAdmin):
    list_display = ('user', 'horse', 'created_at')
    search_fields = ('name', 'name')
    list_filter = ('created_at',)
