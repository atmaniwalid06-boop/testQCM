const API_KEY = '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'; // <--- Mets ta clé ici

const video = document.getElementById('video');
const captureBtn = document.getElementById('capture-btn');
const resultOverlay = document.getElementById('result-overlay');
const canvas = document.getElementById('canvas');

// Démarrer la caméra arrière
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        video.srcObject = stream;
    } catch (err) {
        alert("Impossible d'accéder à la caméra : " + err);
    }
}

// Analyser l'image avec GPT-4o
async function analyzeImage(base64Image) {
    resultOverlay.style.display = "block";
    resultOverlay.style.color = "#f1c40f"; // Jaune pendant le chargement
    resultOverlay.innerText = "🔍 Analyse du QCM en cours...";

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: "Analyse cette image de QCM. Trouve la question et les options. Donne-moi UNIQUEMENT la bonne réponse sous cette forme : 'La bonne réponse est : [Texte de la réponse]'. Ne réponds rien d'autre." 
                            },
                            { 
                                type: "image_url", 
                                image_url: { url: `data:image/jpeg;base64,${base64Image}` } 
                            }
                        ]
                    }
                ],
                max_tokens: 100
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            const answer = data.choices[0].message.content;
            resultOverlay.style.color = "#2ecc71"; // Vert pour le succès
            resultOverlay.innerText = "✅ " + answer;
        } else {
            throw new Error("Réponse vide");
        }

    } catch (error) {
        console.error(error);
        resultOverlay.style.color = "#e74c3c"; // Rouge pour l'erreur
        resultOverlay.innerText = "❌ Erreur lors de l'analyse.";
    }
}

// Événement clic sur le bouton
captureBtn.addEventListener('click', () => {
    // Dessiner l'image vidéo sur le canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir en Base64 (JPEG compressé pour économiser de la bande passante)
    const base64Image = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];

    // Envoyer à l'IA
    analyzeImage(base64Image);
});

// Lancer la caméra au chargement

initCamera();
