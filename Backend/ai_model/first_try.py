import kagglehub

# Download latest version
path = kagglehub.dataset_download("bloodaxe/animal-pose-dataset")

print("Path to dataset files:", path)