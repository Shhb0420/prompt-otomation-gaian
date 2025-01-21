import fs from 'fs/promises';
import chalk from 'chalk';
import readline from 'readline';


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const askQuestion = (query) => {
    return new Promise(resolve => rl.question(chalk.blueBright(query), resolve));
};

async function generateAndSaveQuestions(filePath, numQuestions) {
    const words1 = ["Jakarta", "Bali", "Surabaya", "Bandung", "Medan", "gunung", "pantai", "hutan", 
        "samudra", "sungai", "telepon", "laptop", "kamera", "internet", "komputer", 
        "mobil", "motor", "sepeda", "pesawat", "kereta api", "kereta listrik", 
        "buku", "majalah", "koran", "film", "musik", "lagu", "puisi", "lukisan", 
        "makanan", "minuman", "buah", "sayur", "nasi goreng", "rendang", "sate", 
        "gulai", "es teh", "kopi", "teh", "kucing", "anjing", "burung", "ikan", 
        "ular", "harimau", "gajah", "singa", "monyet", "pohon", "bunga", "daun", 
        "angkasa", "bulan", "bintang", "matahari", "planet", "galaksi", "astronomi"];
    
    const words2 = ["letak", "sejarah", "ukuran", "populasi", "kecepatan", "penemuan", 
        "nilai", "kedalaman", "jarak", "fungsi", "manfaat", "kelebihan", 
        "kekurangan", "bahan", "harga", "proses", "cara pembuatan", 
        "kandungan gizi", "keunikan", "fakta menarik", "cara kerja", 
        "perawatan", "komponen", "kualitas", "cara penggunaan", "kegunaan", 
        "potensi", "risiko", "aspek penting", "peran", "daya tahan", "karakteristik"];
    
    const words3 = ["dijelaskan", "dihitung", "dibandingkan", "ditentukan", "dijabarkan", 
        "dipahami", "dievaluasi", "diteliti", "diperiksa", "diukur", 
        "diceritakan", "dianalisis", "diproduksi", "diolah", "diadaptasi", 
        "dijual", "dikonsumsi", "dikembangkan", "diperlukan", "digunakan", 
        "diproses", "diketahui", "dilakukan", "diidentifikasi", "diimplementasikan", 
        "diberikan", "diterapkan", "dicari", "diprediksi", "dikuatkan", "disusun"];

    const questions = new Set();
    while (questions.size < numQuestions) {
        const w1 = words1[Math.floor(Math.random() * words1.length)];
        const w2 = words2[Math.floor(Math.random() * words2.length)];
        const w3 = words3[Math.floor(Math.random() * words3.length)];
        const question = `Apa ${w2} dari ${w1} dan bagaimana itu ${w3}?`;
        questions.add(question);
    }

    await fs.writeFile(filePath, JSON.stringify(Array.from(questions), null, 4));
    console.log(chalk.greenBright(`✅ Berhasil menyimpan ${questions.size} pertanyaan ke dalam ${filePath}`));
}

async function readQuestionsFromFile(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(chalk.redBright("❌ Terjadi kesalahan saat membaca file pertanyaan:"), error);
        return [];
    }
}

async function sendQuestion(question, index, total, apiKey, nodeId) {
    const url = `https://${nodeId}.gaia.domains/v1/chat/completions`;

    const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    const data = {
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: question }
        ]
    };

    try {
        console.log(chalk.blueBright(`\n🔵 Pertanyaan ke-${index + 1} dari ${total}`));
        console.log(chalk.cyanBright(`Q: ${question}`));

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.choices && result.choices.length > 0) {
            console.log(chalk.yellowBright(`A: ${result.choices[0].message.content}`));
        } else {
            console.log(chalk.red("A: Tidak ada respons yang diterima."));
        }
    } catch (error) {
        console.error(chalk.redBright('❌ Terjadi kesalahan saat melakukan permintaan:'), error);
    }
}

async function startAskingRepeatedly(filePath, intervalSeconds, times, apiKey, nodeId) {
    const questions = await readQuestionsFromFile(filePath);

    if (questions.length === 0) {
        console.error(chalk.redBright("❌ Tidak ada pertanyaan yang ditemukan dalam file."));
        return;
    }

    for (let i = 0; i < Math.min(times, questions.length); i++) {
        await sendQuestion(questions[i], i, times, apiKey, nodeId);
        await new Promise(resolve => setTimeout(resolve, intervalSeconds * 1000));
    }

    console.log(chalk.greenBright("🎉 Selesai mengirim semua pertanyaan."));
}

const filePath = 'pertanyaan.json';

async function main() {
    console.log(chalk.cyanBright("🚀 Selamat datang di skrip pengujian GaiaNet!"));

    rl.close();  

    await generateAndSaveQuestions(filePath, 1000);
    await startAskingRepeatedly(filePath, 5, 10000, process.env.GAIA_API_KEY, process.env.NODE_ID_KEY);
}

main();