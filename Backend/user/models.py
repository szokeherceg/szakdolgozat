from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    name = models.CharField(max_length=30, null=True, blank=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    lang = models.CharField(max_length=2, default='hu')

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email


class HorseData(models.Model):
    name = models.CharField(max_length=255)
    chip_number = models.CharField(max_length=100, blank=True, default="")
    stable_name = models.CharField(max_length=255, blank=True, default="")
    studbook_number = models.CharField(max_length=100, blank=True, default="")

    birth_date = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=50, blank=True, default="")
    color = models.CharField(max_length=100, blank=True, default="")
    markings = models.TextField(blank=True, default="")
    branding = models.CharField(max_length=255, blank=True, default="")

    breeder = models.CharField(max_length=255, blank=True, default="")
    owner = models.CharField(max_length=255, blank=True, default="")
    father = models.CharField(max_length=255, blank=True, default="")
    mother = models.CharField(max_length=255, blank=True, default="")
    maternal_grandsire = models.CharField(max_length=255, blank=True, default="")

    weight = models.FloatField(null=True, blank=True)
    height = models.FloatField(null=True, blank=True)
    girth = models.FloatField(null=True, blank=True)
    cannon_girth = models.FloatField(null=True, blank=True)

    breed = models.CharField(max_length=100, null=True, blank=True)
    age = models.IntegerField(null=True, blank=True)

    image = models.ImageField(
        upload_to="horse_images/",
        null=True,
        blank=True,
    )
    ai_image = models.ImageField(
        upload_to="ai_results/",
        null=True,
        blank=True,
    )
    desc = models.TextField(null=True, blank=True)

    users = models.ManyToManyField(User, related_name="horses")

    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.name


    def __str__(self):
        return self.name

class HorseMeasurement(models.Model):
    horse = models.ForeignKey(
        HorseData,
        on_delete=models.CASCADE,
        related_name="measurements"
    )
    height = models.FloatField(null=True, blank=True)
    weight = models.FloatField(null=True, blank=True)
    girth = models.FloatField(null=True, blank=True)
    cannon_girth = models.FloatField(null=True, blank=True)
    measured_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.horse.name} - {self.measured_at:%Y-%m-%d %H:%M}"
    
class UserHorse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    horse = models.ForeignKey(HorseData, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.horse.name}"

