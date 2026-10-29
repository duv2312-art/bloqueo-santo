"""Genera los fondos estilo vitral con Qwen Image 2.1 Turbo en el ComfyUI local.

Uso:  python gen_vitrales.py            -> genera todos los que falten
      python gen_vitrales.py 3 7        -> solo los indices dados
"""
import json, sys, time, urllib.request, random, pathlib, shutil

COMFY = "http://127.0.0.1:8000"
OUT = pathlib.Path(__file__).resolve().parent / "originales"
COMFY_OUTPUT = pathlib.Path.home() / "Documents" / "ComfyUI" / "output"
W, H = 1664, 928

STYLE = ("Luminous cathedral stained glass artwork filling the entire frame edge to edge, wide panoramic composition, animated illustration style, "
         "bold dark lead lines, jewel-toned glass: deep cobalt blue, ruby red, emerald green and radiant gold, "
         "warm divine light rays streaming through the glass, soft glow, painterly cel-shaded details, "
         "rich gradients, sacred Catholic art, serene and reverent atmosphere, highly detailed, no text, no letters, no words")

SCENES = [
    "Jesus the Good Shepherd carrying a lamb on his shoulders across green hills at sunrise",
    "the Sacred Heart of Jesus radiating golden flames and light, crown of thorns, white lilies around",
    "the Virgin Mary with blue mantle, hands joined in prayer, crowned with twelve stars, roses at her feet",
    "a glowing golden Eucharistic monstrance on an altar with candles, adoring angels kneeling on both sides",
    "Jesus praying alone in the garden of Gethsemane at night under olive trees, an angel bringing light",
    "a dove of the Holy Spirit descending with rays of fire over a calm sea and open sky",
    "the empty tomb at dawn, the stone rolled away, radiant light, lilies blooming, Easter morning",
    "Saint Michael the Archangel with shining armor and sword defeating the darkness, wings spread",
    "the Holy Family, Mary, Joseph and child Jesus in the carpenter workshop in Nazareth, warm light",
    "a true vine with grapes and branches wrapping around a cross, golden sunlight, John 15 symbolism",
    "Jesus walking on stormy waters reaching out his hand to Peter who is sinking, light breaking through clouds",
    "the return of the prodigal son, the father embracing his kneeling son, warm sunset",
    "a lone pilgrim walking a narrow path up a mountain toward a shining cross on the summit, stars above",
    "the Annunciation, the angel Gabriel greeting Mary in prayer, lilies and golden light",
    "a quiet chapel interior with a single candle burning before the tabernacle, rays of light",
    "Jesus as the Light of the World holding a lantern and knocking on a wooden door covered with vines",
    "the Divine Mercy, Jesus with red and pale rays streaming from his heart over a kneeling faithful",
    "a lighthouse with a cross on top shining over a dark sea guiding a small boat home",
    "the Transfiguration on Mount Tabor: Jesus standing in dazzling white robes, radiant golden light, his face beautiful, serene and gentle, well-proportioned symmetrical features, calm kind eyes, soft beard, Moses and Elijah at his sides gazing at him in reverence, three apostles kneeling below in awe",
    "a golden chalice and host with wheat and grapes, radiant halo, Eucharistic symbolism",
    "Saint Joseph holding the child Jesus and a lily, workshop tools, gentle protective light",
    "a heavenly choir of angels with trumpets and harps among golden clouds",
    "Jesus calming the storm in the boat with the apostles, waves settling, rainbow light",
    "a monk kneeling in prayer in a cloister garden with a fountain at dawn, Benedictine peace",
]


def post(path, data):
    req = urllib.request.Request(COMFY + path, json.dumps(data).encode(), {"Content-Type": "application/json"})
    return json.load(urllib.request.urlopen(req))


def get(path):
    return json.load(urllib.request.urlopen(COMFY + path))


def graph(prompt, seed):
    return {
        "1": {"class_type": "UNETLoader", "inputs": {"unet_name": "qwen_image_2.1_turbo_int8_convrot.safetensors", "weight_dtype": "default"}},
        "2": {"class_type": "CLIPLoader", "inputs": {"clip_name": "qwen3vl_8b_int8_convrot.safetensors", "type": "qwen_image", "device": "default"}},
        "3": {"class_type": "VAELoader", "inputs": {"vae_name": "qwen_image_2.1_vae_bf16.safetensors"}},
        "4": {"class_type": "QwenImage21Cache", "inputs": {"model": ["1", 0], "device": "auto", "dtype": "default"}},
        "5": {"class_type": "TextEncodeQwenImage21", "inputs": {"clip": ["2", 0], "prompt": prompt,
              "negative_prompt": "text, letters, watermark, signature, blurry, deformed hands, extra fingers, ugly faces",
              "resolution": 1024, "vae": ["3", 0]}},
        "6": {"class_type": "EmptyLatentImage", "inputs": {"width": W, "height": H, "batch_size": 1}},
        "7": {"class_type": "CFGGuider", "inputs": {"model": ["4", 0], "positive": ["5", 0], "negative": ["5", 1], "cfg": 1}},
        "8": {"class_type": "KSamplerSelect", "inputs": {"sampler_name": "euler"}},
        "9": {"class_type": "ManualSigmas", "inputs": {"sigmas": "1.0, 0.978453, 0.95418, 0.926626, 0.89508, 0.845148, 0.704534, 0.414568, 0"}},
        "10": {"class_type": "RandomNoise", "inputs": {"noise_seed": seed}},
        "11": {"class_type": "SamplerCustomAdvanced", "inputs": {"noise": ["10", 0], "guider": ["7", 0], "sampler": ["8", 0], "sigmas": ["9", 0], "latent_image": ["6", 0]}},
        "12": {"class_type": "VAEDecode", "inputs": {"samples": ["11", 0], "vae": ["3", 0]}},
        "13": {"class_type": "SaveImage", "inputs": {"images": ["12", 0], "filename_prefix": "bloqueo_santo/vitral"}},
    }


def run(i):
    dest = OUT / f"vitral_{i:02d}.png"
    prompt = f"{STYLE}. Scene: {SCENES[i]}."
    pid = post("/prompt", {"prompt": graph(prompt, random.randint(1, 2**48))})["prompt_id"]
    while True:
        h = get(f"/history/{pid}")
        if pid in h:
            break
        time.sleep(2)
    st = h[pid]["status"]
    if st.get("status_str") != "success":
        print(i, "FALLO", json.dumps(st)[:800]); return
    img = h[pid]["outputs"]["13"]["images"][0]
    shutil.copy(COMFY_OUTPUT / img["subfolder"] / img["filename"], dest)
    print(i, "ok", dest.name, flush=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    idx = [int(a) for a in sys.argv[1:]] or [i for i in range(len(SCENES)) if not (OUT / f"vitral_{i:02d}.png").exists()]
    for i in idx:
        run(i)
