import os
from PIL import Image


def resize_image(image_path, output_folder, scale, width, height):
    with Image.open(image_path) as img:
        if scale and isinstance(scale, int):
            new_width = img.width * scale
            new_height = img.height * scale
        elif scale and isinstance(scale, str) and scale.isdigit():
            new_width = int(img.width * scale)
            new_height = int(img.height * scale)
        elif width and isinstance(width, str) and width.isdigit() and height and isinstance(height, str) and height.isdigit():
            new_width = int(width)
            new_height = int(height)
        elif width and isinstance(width, int) and height and isinstance(height, int):
            new_width = width
            new_height = height
        else:
            raise ValueError('You must provide scale or width and height parameters!')
        resized_img = img.resize((new_width, new_height), Image.ANTIALIAS)

        filename = os.path.basename(image_path)
        output_path = os.path.join(output_folder, filename)
        resized_img.save(output_path)
        print(f"Resized and saved: {output_path}")


def resize_images_in_folder(input_folder, output_folder, scale=None, width=None, height=None):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    for filename in os.listdir(input_folder):
        file_path = os.path.join(input_folder, filename)

        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff')):
            resize_image(file_path, output_folder, scale, width, height)
        else:
            print(f"Skipping non-image file: {filename}")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(script_dir, "..")
    iamges_folder = os.path.join(project_root, "src", "assets", "images")

    input_folder = os.path.join(iamges_folder, "to_thumbnails")
    output_folder = os.path.join(iamges_folder, "thumbnails")

    resize_images_in_folder(input_folder, output_folder, width=512, height=512)
    print("All images have been resized and saved.")
