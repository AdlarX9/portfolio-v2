import os
from PIL import Image

# --- CONFIGURATION ---
DOSSIER_CIBLE = "/Users/Alexis/Desktop"
TAILLE_MAX = 1024
# ---------------------


def resize_images():
    if not os.path.exists(DOSSIER_CIBLE):
        print(f"Erreur : Le dossier '{DOSSIER_CIBLE}' n'existe pas.")
        return

    dossier_sortie = os.path.join(DOSSIER_CIBLE, "resized")
    if not os.path.exists(dossier_sortie):
        os.makedirs(dossier_sortie)

    # On accepte aussi les PNG si jamais tu en as
    extensions_valides = (".jpg", ".jpeg", ".JPG", ".JPEG", ".png", ".PNG")
    count = 0

    print(f"Traitement des images dans : {DOSSIER_CIBLE}...")

    for filename in os.listdir(DOSSIER_CIBLE):
        if filename.endswith(extensions_valides):
            filepath = os.path.join(DOSSIER_CIBLE, filename)

            try:
                with Image.open(filepath) as img:
                    # 1. Conversion RGBA -> RGB (Correction du bug)
                    # Si l'image a un canal Alpha (transparence), on le convertit en RGB pur
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")

                    # 2. Calcul des dimensions
                    width, height = img.size
                    if width > height:
                        new_width = TAILLE_MAX
                        new_height = int(height * (TAILLE_MAX / width))
                    else:
                        new_height = TAILLE_MAX
                        new_width = int(width * (TAILLE_MAX / height))

                    # 3. Redimensionnement
                    img_resized = img.resize(
                        (new_width, new_height), Image.Resampling.LANCZOS
                    )

                    # 4. Sauvegarde
                    # On force l'extension .jpg pour la sortie même si l'entrée était .png
                    nom_sans_ext = os.path.splitext(filename)[0]
                    output_filename = f"{nom_sans_ext}.jpg"
                    output_path = os.path.join(dossier_sortie, output_filename)

                    img_resized.save(output_path, "JPEG", quality=85, optimize=True)

                    print(f"OK : {filename} -> {output_filename}")
                    count += 1

            except Exception as e:
                print(f"Erreur sur {filename}: {e}")

    print(f"Terminé ! {count} images redimensionnées dans '{dossier_sortie}'.")


if __name__ == "__main__":
    resize_images()
