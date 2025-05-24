import torch
from torchvision import models, transforms
from transformers import BertTokenizer, BertModel
from PIL import Image
from .models import Disease

class AnimalDiseaseModel:
    def __init__(self, num_classes):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        # Image model: use pretrained ResNet50, remove final layer to get features
        self.image_model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.image_model.fc = torch.nn.Identity()  # output raw features
        # Text model: pretrained BERT (outputs 768-dim pooled features)
        self.tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
        self.text_model = BertModel.from_pretrained('bert-base-uncased')
        # Classification head: combine image (2048) + text (768) features -> disease classes
        self.classifier = torch.nn.Linear(2048 + 768, num_classes)
        # Load trained weights if available:
        # self.image_model.load_state_dict(torch.load('image_model.pth'))
        # self.text_model.load_state_dict(torch.load('text_model.pth'))
        # self.classifier.load_state_dict(torch.load('classifier.pth'))

        self.image_model.to(self.device).eval()
        self.text_model.to(self.device).eval()
        self.classifier.to(self.device).eval()
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])

    def predict(self, image_path, symptom_text):
        # Preprocess image
        image = Image.open(image_path).convert('RGB')
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        # Preprocess text
        tokens = self.tokenizer(symptom_text, return_tensors='pt',
                                padding=True, truncation=True).to(self.device)
        # Inference
        with torch.no_grad():
            img_feat = self.image_model(img_tensor)            # (1, 2048)
            txt_outputs = self.text_model(**tokens)
            txt_feat = txt_outputs.pooler_output               # (1, 768)
            combined = torch.cat((img_feat, txt_feat), dim=1)  # (1, 2816)
            logits = self.classifier(combined)                 # (1, num_classes)
            pred_index = torch.argmax(logits, dim=1).item()
        # Map index to a disease name
        disease_names = list(Disease.objects.values_list('name', flat=True))
        if 0 <= pred_index < len(disease_names):
            return disease_names[pred_index]
        return None
