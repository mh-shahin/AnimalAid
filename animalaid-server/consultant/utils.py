# consultant/utils.py
# import base64
# import json
# import traceback
# from django.conf import settings

# # ✅ Correct imports for the new OpenAI SDK (v1+)
# from openai import OpenAI
# from openai import OpenAIError, RateLimitError, APIError, AuthenticationError

# def get_openai_client():
#     api_key = getattr(settings, "OPENAI_API_KEY", None)
#     if not api_key:
#         return None
#     return OpenAI(api_key=api_key)

# def files_to_b64_list(file_list):
#     b64s = []
#     for f in file_list:
#         try:
#             f.seek(0)
#             data = f.read()
#             f.seek(0)
#             # take small snippet only
#             snippet = data[:8000]
#             b64s.append(base64.b64encode(snippet).decode("utf-8"))
#         except Exception as e:
#             print("⚠️ files_to_b64_list error:", e)
#     return b64s

# def _mock_analysis(description, animal_type, images):
#     # deterministic fallback based on keywords — improve as you like
#     text = (description or "").lower()
#     if "scratch" in text or "skin" in text or "itch" in text:
#         detected = "Dermatitis"
#         medicines = [
#             {"name": "Topical Antibacterial Ointment", "dosage": "Apply thin layer twice daily"},
#             {"name": "Anti-itch Spray", "dosage": "Apply as needed (max 4x/day)"}
#         ]
#         treatment = "Clean area with saline, apply topical antibiotic, keep dry and observe."
#         confidence = 78
#     elif "not eat" in text or "loss of appetite" in text or "not eating" in text:
#         detected = "Digestive disorder"
#         medicines = [
#             {"name": "Probiotic Supplement", "dosage": "1 capsule daily with food"}
#         ]
#         treatment = "Offer bland diet, ensure hydration, monitor for 24-48 hours."
#         confidence = 72
#     else:
#         detected = "Possible infection or inflammation"
#         medicines = [{"name": "Vet-prescribed antibiotic", "dosage": "Follow vet instructions"}]
#         treatment = "Keep area clean; consult a veterinarian for definitive diagnosis."
#         confidence = 65

#     return {
#         "detectedIssue": detected,
#         "confidence": confidence,
#         "possibleCauses": ["Bacterial infection", "Allergic reaction", "Environmental irritants"],
#         "recommendedTreatment": treatment,
#         "recommendedMedicines": medicines,
#         "veterinaryAdvice": "If condition persists or worsens within 48 hours, consult a veterinarian.",
#         "meta": {"images_received": len(images), "description_length": len(description or "")},
#         "note": "This is a fallback analysis because OpenAI request failed or is unavailable."
#     }

# def analyze_with_openai(description, animal_type, image_files):
#     """
#     Attempt real OpenAI analysis. If OpenAI fails (quota, auth, network),
#     return a safe mock analysis instead of raising a 500.
#     """
#     client = get_openai_client()
#     b64_images = files_to_b64_list(image_files)

#     # If no API key configured, return mock immediately
#     if client is None:
#         print("⚠️ OPENAI_API_KEY not configured — returning fallback analysis.")
#         return _mock_analysis(description, animal_type, image_files)

#     # Build a compact prompt (avoid huge base64 in prompt to reduce cost)
#     prompt = f"""
# You are an experienced veterinary assistant. Reply ONLY with valid JSON with keys:
# detectedIssue, confidence, possibleCauses (list), recommendedTreatment,
# recommendedMedicines (list of objects name + dosage), veterinaryAdvice.

# Animal type: {animal_type}
# Description: {description}
# Images received: {len(b64_images)}
# (Do not include base64 data in response.)
# """

#     try:
#         resp = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[
#                 {"role": "system", "content": "You are a veterinary assistant. Output strictly JSON."},
#                 {"role": "user", "content": prompt}
#             ],
#             max_tokens=700,
#             temperature=0.0,
#         )
#         text = resp.choices[0].message.content.strip()
#         print("🔹 OpenAI raw output (preview):", text[:500])
#         # parse JSON
#         parsed = json.loads(text)
#         parsed.setdefault("meta", {})
#         parsed["meta"].setdefault("images_received", len(image_files))
#         parsed["meta"].setdefault("description_length", len(description or ""))
#         return parsed

#     except RateLimitError as e:
#         print("❌ OpenAI RateLimitError:", e)
#         # Return fallback, but include info for frontend/debug
#         fallback = _mock_analysis(description, animal_type, image_files)
#         fallback["error"] = "OpenAI quota exceeded (RateLimitError). Returning fallback analysis."
#         return fallback

#     except AuthenticationError as e:
#         print("❌ OpenAI AuthenticationError:", e)
#         fallback = _mock_analysis(description, animal_type, image_files)
#         fallback["error"] = "OpenAI authentication failed. Returning fallback analysis."
#         return fallback

#     except APIError as e:
#         print("❌ OpenAI APIError:", e)
#         fallback = _mock_analysis(description, animal_type, image_files)
#         fallback["error"] = "OpenAI API error. Returning fallback analysis."
#         return fallback

#     except OpenAIError as e:
#         print("❌ OpenAIError:", e)
#         fallback = _mock_analysis(description, animal_type, image_files)
#         fallback["error"] = "OpenAI general error. Returning fallback analysis."
#         return fallback

#     except Exception as e:
#         print("❌ Unexpected error calling OpenAI:", e)
#         print(traceback.format_exc())
#         # If something else goes wrong, return fallback
#         fallback = _mock_analysis(description, animal_type, image_files)
#         fallback["error"] = "Unexpected error. Returning fallback analysis."
#         return fallback


import base64
import json
import traceback
import requests
from django.conf import settings

def files_to_b64_list(file_list):
    b64s = []
    for f in file_list:
        try:
            f.seek(0)
            data = f.read()
            f.seek(0)
            snippet = data[:8000]
            b64s.append(base64.b64encode(snippet).decode("utf-8"))
        except Exception as e:
            print("⚠️ files_to_b64_list error:", e)
    return b64s

def _mock_analysis(description, animal_type, images):
    text = (description or "").lower()
    if "scratch" in text or "skin" in text or "itch" in text:
        detected = "Dermatitis"
        medicines = [
            {"name": "Topical Antibacterial Ointment", "dosage": "Apply thin layer twice daily"},
            {"name": "Anti-itch Spray", "dosage": "Apply as needed (max 4x/day)"}
        ]
        treatment = "Clean area with saline, apply topical antibiotic, keep dry and observe."
        confidence = 78
    elif "not eat" in text or "loss of appetite" in text or "not eating" in text:
        detected = "Digestive disorder"
        medicines = [
            {"name": "Probiotic Supplement", "dosage": "1 capsule daily with food"}
        ]
        treatment = "Offer bland diet, ensure hydration, monitor for 24-48 hours."
        confidence = 72
    else:
        detected = "Possible infection or inflammation"
        medicines = [
            {"name": "Vet-prescribed antibiotic", "dosage": "Follow vet instructions"}
        ]
        treatment = "Keep area clean; consult a veterinarian for definitive diagnosis."
        confidence = 65

    return {
        "detectedIssue": detected,
        "confidence": confidence,
        "possibleCauses": ["Bacterial infection", "Allergic reaction", "Environmental irritants"],
        "recommendedTreatment": treatment,
        "recommendedMedicines": medicines,
        "veterinaryAdvice": "If condition persists or worsens within 48 hours, consult a veterinarian.",
        "meta": {"images_received": len(images), "description_length": len(description or "")},
        "note": "This is a fallback analysis because HF inference failed or model not configured."
    }

def analyze_with_hf(description, animal_type, image_files):
    hf_token = getattr(settings, "HF_API_TOKEN", None)
    model_id  = getattr(settings, "HF_MODEL_ID", None)
    if not hf_token or not model_id:
        print("⚠️ HF API token or MODEL_ID not configured — returning fallback.")
        return _mock_analysis(description, animal_type, image_files)

    b64_images = files_to_b64_list(image_files)

    prompt = f"""
Animal type: {animal_type}
Description: {description}
Images received: {len(b64_images)}
Provide output strictly in JSON form with these keys:
detectedIssue, confidence (0-100), possibleCauses (list),
recommendedTreatment, recommendedMedicines (list of objects name + dosage),
veterinaryAdvice.
"""

    url = f"https://api-inference.huggingface.co/models/{model_id}"
    headers = {
        "Authorization": f"Bearer {hf_token}",
        "Content-Type": "application/json"
    }
    # Build json payload; some VLMs handle image bytes or base64, adjust accordingly
    payload = {
        "inputs": {
            "text": prompt,
            "images": b64_images  # NOTE: model must support “images” field; else adapt
        },
        "options": {
            "wait_for_model": True
        }
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=60)
        resp.raise_for_status()
        output = resp.json()
        # Depending on model, output may be list or dict; adapt parsing:
        if isinstance(output, list):
            result_text = output[0].get("generated_text") or output[0].get("text") or json.dumps(output[0])
        elif isinstance(output, dict):
            result_text = output.get("generated_text") or output.get("text") or json.dumps(output)
        else:
            result_text = json.dumps(output)

        print("🔹 HF raw output (preview):", result_text[:500])

        parsed = json.loads(result_text)
        parsed.setdefault("meta", {})
        parsed["meta"].setdefault("images_received", len(image_files))
        parsed["meta"].setdefault("description_length", len(description or ""))

        return parsed

    except requests.exceptions.HTTPError as e:
        print("❌ HF HTTPError:", e, resp.text)
        return _mock_analysis(description, animal_type, image_files)
    except Exception as e:
        print("❌ Unexpected error calling HF API:", e)
        print(traceback.format_exc())
        return _mock_analysis(description, animal_type, image_files)
