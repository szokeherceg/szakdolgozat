from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import User, HorseData, UserHorse


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = User
        fields = ('email', 'name', 'lang')


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = User
        fields = (
            'email',
            'name',
            'lang',
            'is_active',
            'is_staff',
            'is_superuser',
            'groups',
            'user_permissions',
        )


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User

    list_display = ('email', 'name', 'lang', 'date_joined', 'is_active', 'is_staff')
    search_fields = ('email', 'name')
    list_filter = ('lang', 'is_active', 'is_staff')
    ordering = ('-date_joined',)
    readonly_fields = ('date_joined',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Személyes adatok', {'fields': ('name', 'lang')}),
        (
            'Jogosultságok',
            {
                'fields': (
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'user_permissions',
                )
            },
        ),
        ('Csatlakozás dátuma', {'fields': ('date_joined',)}),
    )

    add_fieldsets = (
        (
            None,
            {
                'fields': (
                    'email',
                    'name',
                    'lang',
                    'password1',
                    'password2',
                    'is_active',
                    'is_staff',
                ),
            },
        ),
    )


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
