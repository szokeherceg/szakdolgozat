import shutil
import tempfile
from io import BytesIO

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APIClient

from .models import HorseData, User, UserHorse

PASSWORD = "Zold-Alma-Kert-Fa-Hegy"

# Uploaded test images go to a temporary folder, not to the project's media folder.
TEMP_MEDIA = tempfile.mkdtemp(prefix="lovasai_test_media_")


def make_image():
    buffer = BytesIO()
    Image.new("RGB", (20, 20), "white").save(buffer, format="PNG")
    return SimpleUploadedFile("test.png", buffer.getvalue(), content_type="image/png")


@override_settings(MEDIA_ROOT=TEMP_MEDIA)
class ApiTests(TestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TEMP_MEDIA, ignore_errors=True)

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user("user@example.com", PASSWORD)
        self.client.force_authenticate(self.user)

    def add_horse(self, chip):
        return self.client.post(
            reverse("horse-data"),
            {"name": "Horse", "chip_number": chip, "owner": "Owner"},
            format="multipart",
        )

    def test_chip_number_is_unique(self):
        self.assertEqual(self.add_horse("HU-001").status_code, 201)
        self.assertEqual(self.add_horse("HU-001").status_code, 400)
        self.assertEqual(HorseData.objects.filter(chip_number="HU-001").count(), 1)

    def test_height_out_of_range(self):
        horse = HorseData.objects.create(name="Horse", chip_number="HU-002", owner="Owner")
        UserHorse.objects.create(user=self.user, horse=horse)

        for height in ("49", "176"):
            with self.subTest(height=height):
                response = self.client.post(
                    reverse("horse-measurements", args=[horse.id]),
                    {
                        "measured_at": "2025-01-01T10:00:00Z",
                        "height": height,
                        "image": make_image(),
                    },
                    format="multipart",
                )
                self.assertEqual(response.status_code, 400)

        self.assertEqual(horse.measurements.count(), 0)

    def test_password_rules(self):
        for password in ("Jelszo-Valami-Hosszu-Szo", "Short-Pw-9"):
            with self.subTest(password=password):
                response = self.client.post(
                    reverse("register"),
                    {"email": "new@example.com", "password": password},
                    format="json",
                )
                self.assertEqual(response.status_code, 400)

        response = self.client.post(
            reverse("register"),
            {"email": "new@example.com", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_foreign_horse_is_not_accessible(self):
        other = User.objects.create_user("other@example.com", PASSWORD)
        horse = HorseData.objects.create(name="Horse", chip_number="HU-003", owner="Owner")
        UserHorse.objects.create(user=other, horse=horse)

        foreign = self.client.get(reverse("horse-detail", args=[horse.id]))
        missing = self.client.get(reverse("horse-detail", args=[horse.id + 1000]))

        # Same answer as for a non-existent horse, so its existence is not revealed.
        self.assertEqual(foreign.status_code, 404)
        self.assertEqual(missing.status_code, 404)
