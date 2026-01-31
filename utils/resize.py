import os
from PIL import Image

# --- CONFIGURATION ---
# Chemin du dossier contenant tes images
# Met '.' pour le dossier courant, ou un chemin complet ex: 'C:/Users/Toi/Images'
DOSSIER_CIBLE = "/Users/Alexis/Desktop"

# Taille cible pour le côté le plus long
TAILLE_MAX = 1024
# ---------------------


def resize_images():
    # Vérifie que le dossier existe
    if not os.path.exists(DOSSIER_CIBLE):
        print(f"Erreur : Le dossier '{DOSSIER_CIBLE}' n'existe pas.")
        return

    # Création d'un sous-dossier pour les résultats (pour ne pas écraser les originaux)
    dossier_sortie = os.path.join(DOSSIER_CIBLE, "resized")
    if not os.path.exists(dossier_sortie):
        os.makedirs(dossier_sortie)

    # Extensions acceptées
    extensions_valides = (".jpg", ".jpeg", ".JPG", ".JPEG")

    count = 0

    print(f"Traitement des images dans : {DOSSIER_CIBLE}...")

    for filename in os.listdir(DOSSIER_CIBLE):
        if filename.endswith(extensions_valides):
            filepath = os.path.join(DOSSIER_CIBLE, filename)

            try:
                with Image.open(filepath) as img:
                    # Récupération des dimensions actuelles
                    width, height = img.size

                    # Calcul des nouvelles dimensions en gardant le ratio
                    if width > height:
                        # Paysage : la largeur devient 1024
                        new_width = TAILLE_MAX
                        new_height = int(height * (TAILLE_MAX / width))
                    else:
                        # Portrait ou Carré : la hauteur devient 1024
                        new_height = TAILLE_MAX
                        new_width = int(width * (TAILLE_MAX / height))

                    # Redimensionnement (LANCZOS est le meilleur filtre pour la qualité)
                    img_resized = img.resize(
                        (new_width, new_height), Image.Resampling.LANCZOS
                    )

                    # Sauvegarde dans le dossier 'resized'
                    # optimize=True et quality=85 offrent un excellent ratio poids/qualité
                    output_path = os.path.join(dossier_sortie, filename)
                    img_resized.save(output_path, "JPEG", quality=85, optimize=True)

                    print(
                        f"OK : {filename} ({width}x{height} -> {new_width}x{new_height})"
                    )
                    count += 1

            except Exception as e:
                print(f"Erreur sur {filename}: {e}")

    print(
        f"Terminé ! {count} images redimensionnées dans le dossier '{dossier_sortie}'."
    )


if __name__ == "__main__":
    resize_images()
