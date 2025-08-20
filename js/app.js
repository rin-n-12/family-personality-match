// グローバル変数
let currentPerson = null; // 'mother', 'father', 'child'
let currentQuestionIndex = 0;
let answers = {};
let results = {
    mother: null,
    father: null,
    child: null
};
let radarChart = null;

// ビッグファイブ理論に基づく質問項目
const questions = [
    // 外向性 (Extraversion)
    { text: "パーティーや社交的な集まりを楽しむ", trait: "extraversion", reversed: false },
    { text: "初対面の人とも気軽に話すことができる", trait: "extraversion", reversed: false },
    { text: "一人で過ごすより、人と一緒にいる方が好き", trait: "extraversion", reversed: false },
    { text: "静かで落ち着いた環境を好む", trait: "extraversion", reversed: true },
    
    // 協調性 (Agreeableness)
    { text: "他人の気持ちを理解し、共感することが得意", trait: "agreeableness", reversed: false },
    { text: "困っている人を見ると助けたくなる", trait: "agreeableness", reversed: false },
    { text: "他人を信頼しやすい", trait: "agreeableness", reversed: false },
    { text: "自分の意見を曲げることは少ない", trait: "agreeableness", reversed: true },
    
    // 誠実性 (Conscientiousness)
    { text: "計画を立てて物事を進めるのが得意", trait: "conscientiousness", reversed: false },
    { text: "締め切りや約束を守ることを重視する", trait: "conscientiousness", reversed: false },
    { text: "整理整頓された環境を好む", trait: "conscientiousness", reversed: false },
    { text: "その場の流れに任せることが多い", trait: "conscientiousness", reversed: true },
    
    // 神経症傾向 (Neuroticism)
    { text: "ストレスを感じやすい", trait: "neuroticism", reversed: false },
    { text: "心配事があると眠れなくなることがある", trait: "neuroticism", reversed: false },
    { text: "感情の起伏が激しい方だ", trait: "neuroticism", reversed: false },
    { text: "プレッシャーの中でも冷静でいられる", trait: "neuroticism", reversed: true },
    
    // 開放性 (Openness)
    { text: "新しいことに挑戦するのが好き", trait: "openness", reversed: false },
    { text: "想像力が豊かだと思う", trait: "openness", reversed: false },
    { text: "芸術や文化に興味がある", trait: "openness", reversed: false },
    { text: "慣れ親しんだ方法を変えることに抵抗がある", trait: "openness", reversed: true }
];

// 特性の日本語ラベル
const traitLabels = {
    extraversion: "外向性",
    agreeableness: "協調性",
    conscientiousness: "誠実性",
    neuroticism: "神経症傾向",
    openness: "開放性"
};

// 画面切り替え関数
function showScreen(screenId) {
    const screens = ['startScreen', 'selectPersonScreen', 'questionScreen', 'resultScreen'];
    screens.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

// スタート画面に戻る
function showStartScreen() {
    showScreen('startScreen');
}

// 診断開始
function startDiagnosis() {
    showScreen('selectPersonScreen');
}

// 診断者選択
function selectPerson(person) {
    currentPerson = person;
    currentQuestionIndex = 0;
    answers[person] = [];
    
    // ラベル更新
    const labels = {
        mother: "母親の診断",
        father: "父親の診断",
        child: "子どもの診断"
    };
    document.getElementById('currentPersonLabel').textContent = labels[person];
    document.getElementById('totalQuestions').textContent = questions.length;
    
    showQuestion();
    showScreen('questionScreen');
}

// 質問表示
function showQuestion() {
    const question = questions[currentQuestionIndex];
    document.getElementById('questionText').textContent = question.text;
    document.getElementById('currentQuestionNum').textContent = currentQuestionIndex + 1;
    
    // プログレスバー更新
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = progress + '%';
    
    // 前へボタンの制御
    document.getElementById('prevButton').disabled = currentQuestionIndex === 0;
}

// 質問に回答
function answerQuestion(score) {
    const question = questions[currentQuestionIndex];
    
    // 逆転項目の処理
    const adjustedScore = question.reversed ? (6 - score) : score;
    
    // 回答を保存
    if (!answers[currentPerson][currentQuestionIndex]) {
        answers[currentPerson][currentQuestionIndex] = {};
    }
    answers[currentPerson][currentQuestionIndex] = {
        trait: question.trait,
        score: adjustedScore
    };
    
    // 次の質問へ
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        // 診断完了
        calculateResults();
    }
}

// 前の質問に戻る
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// 結果計算
function calculateResults() {
    const traits = ['extraversion', 'agreeableness', 'conscientiousness', 'neuroticism', 'openness'];
    const result = {};
    
    traits.forEach(trait => {
        const traitAnswers = answers[currentPerson].filter(a => a && a.trait === trait);
        const sum = traitAnswers.reduce((acc, a) => acc + a.score, 0);
        const average = sum / traitAnswers.length;
        // 0-100のスケールに変換
        result[trait] = Math.round((average - 1) * 25);
    });
    
    results[currentPerson] = result;
    showResults();
}

// 結果表示
function showResults() {
    showScreen('resultScreen');
    
    // レーダーチャート描画
    drawRadarChart();
    
    // スコア詳細表示
    showScoreDetails();
    
    // 相性分析（親子両方の結果がある場合）
    analyzeCompatibility();
    
    // アドバイス生成
    generateAdvice();
}

// レーダーチャート描画
function drawRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    // 既存のチャートを破棄
    if (radarChart) {
        radarChart.destroy();
    }
    
    // データセット作成
    const datasets = [];
    const colors = {
        mother: { bg: 'rgba(255, 99, 132, 0.2)', border: 'rgb(255, 99, 132)' },
        father: { bg: 'rgba(54, 162, 235, 0.2)', border: 'rgb(54, 162, 235)' },
        child: { bg: 'rgba(75, 192, 192, 0.2)', border: 'rgb(75, 192, 192)' }
    };
    
    const personLabels = {
        mother: '母親',
        father: '父親',
        child: '子ども'
    };
    
    Object.keys(results).forEach(person => {
        if (results[person]) {
            datasets.push({
                label: personLabels[person],
                data: [
                    results[person].extraversion,
                    results[person].agreeableness,
                    results[person].conscientiousness,
                    results[person].neuroticism,
                    results[person].openness
                ],
                fill: true,
                backgroundColor: colors[person].bg,
                borderColor: colors[person].border,
                pointBackgroundColor: colors[person].border,
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: colors[person].border
            });
        }
    });
    
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['外向性', '協調性', '誠実性', '神経症傾向', '開放性'],
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.r + '点';
                        }
                    }
                }
            }
        }
    });
}

// スコア詳細表示
function showScoreDetails() {
    const container = document.getElementById('scoreDetails');
    container.innerHTML = '';
    
    const traits = ['extraversion', 'agreeableness', 'conscientiousness', 'neuroticism', 'openness'];
    const personLabels = {
        mother: '母親',
        father: '父親',
        child: '子ども'
    };
    
    traits.forEach(trait => {
        const traitDiv = document.createElement('div');
        traitDiv.className = 'mb-4';
        
        let html = `<h4 class="font-semibold mb-2">${traitLabels[trait]}</h4>`;
        
        Object.keys(results).forEach(person => {
            if (results[person]) {
                const score = results[person][trait];
                const level = getLevel(score);
                const color = getColorForScore(score);
                
                html += `
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm">${personLabels[person]}</span>
                        <div class="flex items-center">
                            <div class="w-32 bg-gray-200 rounded-full h-2 mr-2">
                                <div class="h-2 rounded-full" style="width: ${score}%; background-color: ${color}"></div>
                            </div>
                            <span class="text-sm font-semibold" style="color: ${color}">${score}点 (${level})</span>
                        </div>
                    </div>
                `;
            }
        });
        
        traitDiv.innerHTML = html;
        container.appendChild(traitDiv);
    });
}

// スコアレベル判定
function getLevel(score) {
    if (score >= 80) return '非常に高い';
    if (score >= 60) return '高い';
    if (score >= 40) return '平均的';
    if (score >= 20) return '低い';
    return '非常に低い';
}

// スコアに応じた色
function getColorForScore(score) {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    if (score >= 20) return '#ef4444';
    return '#6b7280';
}

// 相性分析
function analyzeCompatibility() {
    const container = document.getElementById('compatibilityAnalysis');
    const content = document.getElementById('compatibilityContent');
    
    // 親と子の結果がある場合のみ表示
    const hasParent = results.mother || results.father;
    const hasChild = results.child;
    
    if (hasParent && hasChild) {
        container.classList.remove('hidden');
        
        const parentData = results.mother || results.father;
        const parentLabel = results.mother ? '母親' : '父親';
        
        // 相性スコア計算
        const traits = ['extraversion', 'agreeableness', 'conscientiousness', 'neuroticism', 'openness'];
        let similarityScore = 0;
        let analysisHtml = '<div class="space-y-4">';
        
        // 全体的な相性スコア
        traits.forEach(trait => {
            const diff = Math.abs(parentData[trait] - results.child[trait]);
            similarityScore += (100 - diff) / traits.length;
        });
        
        analysisHtml += `
            <div class="bg-white p-4 rounded-lg">
                <h4 class="font-semibold mb-2">全体的な特性の類似度</h4>
                <div class="flex items-center">
                    <div class="w-full bg-gray-200 rounded-full h-4 mr-3">
                        <div class="h-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" style="width: ${Math.round(similarityScore)}%"></div>
                    </div>
                    <span class="font-bold text-lg">${Math.round(similarityScore)}%</span>
                </div>
            </div>
        `;
        
        // 特性別の比較
        const significantDiffs = [];
        const similarities = [];
        
        traits.forEach(trait => {
            const diff = Math.abs(parentData[trait] - results.child[trait]);
            if (diff > 30) {
                significantDiffs.push({ trait, diff, parentScore: parentData[trait], childScore: results.child[trait] });
            } else if (diff < 15) {
                similarities.push({ trait, diff, parentScore: parentData[trait], childScore: results.child[trait] });
            }
        });
        
        if (similarities.length > 0) {
            analysisHtml += '<div class="bg-green-50 p-4 rounded-lg"><h4 class="font-semibold mb-2 text-green-800">😊 共通点</h4><ul class="text-sm space-y-1">';
            similarities.forEach(item => {
                analysisHtml += `<li><i class="fas fa-check text-green-600 mr-2"></i>${traitLabels[item.trait]}が似ています</li>`;
            });
            analysisHtml += '</ul></div>';
        }
        
        if (significantDiffs.length > 0) {
            analysisHtml += '<div class="bg-yellow-50 p-4 rounded-lg"><h4 class="font-semibold mb-2 text-yellow-800">⚡ 違いがある特性</h4><ul class="text-sm space-y-1">';
            significantDiffs.forEach(item => {
                const comparison = item.parentScore > item.childScore ? 
                    `${parentLabel}の方が高い` : 
                    `子どもの方が高い`;
                analysisHtml += `<li><i class="fas fa-info-circle text-yellow-600 mr-2"></i>${traitLabels[item.trait]}: ${comparison}</li>`;
            });
            analysisHtml += '</ul></div>';
        }
        
        analysisHtml += '</div>';
        content.innerHTML = analysisHtml;
    } else {
        container.classList.add('hidden');
    }
}

// アドバイス生成
function generateAdvice() {
    const content = document.getElementById('adviceContent');
    let adviceHtml = '<div class="space-y-4">';
    
    // 個人別アドバイス
    Object.keys(results).forEach(person => {
        if (results[person]) {
            const personLabels = {
                mother: '母親',
                father: '父親',
                child: '子ども'
            };
            
            adviceHtml += `<div class="bg-white p-4 rounded-lg">`;
            adviceHtml += `<h4 class="font-semibold mb-3">${personLabels[person]}の特性に基づくアドバイス</h4>`;
            adviceHtml += '<ul class="text-sm space-y-2">';
            
            // 各特性に基づくアドバイス
            const traits = ['extraversion', 'agreeableness', 'conscientiousness', 'neuroticism', 'openness'];
            
            traits.forEach(trait => {
                const score = results[person][trait];
                const advice = getAdviceForTrait(trait, score, person);
                if (advice) {
                    adviceHtml += `<li><i class="fas fa-lightbulb text-yellow-500 mr-2"></i>${advice}</li>`;
                }
            });
            
            adviceHtml += '</ul></div>';
        }
    });
    
    // 親子関係のアドバイス
    const hasParent = results.mother || results.father;
    if (hasParent && results.child) {
        const parentData = results.mother || results.father;
        const parentLabel = results.mother ? '母親' : '父親';
        
        adviceHtml += '<div class="bg-purple-50 p-4 rounded-lg">';
        adviceHtml += '<h4 class="font-semibold mb-3 text-purple-800">親子関係のアドバイス</h4>';
        adviceHtml += '<ul class="text-sm space-y-2">';
        
        // 外向性の差に基づくアドバイス
        const extraDiff = parentData.extraversion - results.child.extraversion;
        if (Math.abs(extraDiff) > 30) {
            if (extraDiff > 0) {
                adviceHtml += '<li><i class="fas fa-users text-purple-600 mr-2"></i>お子さんは親より内向的な傾向があります。一人の時間も大切にしてあげましょう。</li>';
            } else {
                adviceHtml += '<li><i class="fas fa-users text-purple-600 mr-2"></i>お子さんは親より外向的な傾向があります。社交的な活動の機会を増やしてあげましょう。</li>';
            }
        }
        
        // 神経症傾向の差に基づくアドバイス
        if (results.child.neuroticism > 60) {
            adviceHtml += '<li><i class="fas fa-heart text-purple-600 mr-2"></i>お子さんはストレスを感じやすい傾向があります。安心できる環境づくりを心がけましょう。</li>';
        }
        
        // 誠実性に基づくアドバイス
        if (results.child.conscientiousness < 40) {
            adviceHtml += '<li><i class="fas fa-tasks text-purple-600 mr-2"></i>お子さんの計画性を育てるため、小さな目標から始めて達成感を味わえるようサポートしましょう。</li>';
        }
        
        adviceHtml += '</ul></div>';
    }
    
    adviceHtml += '</div>';
    content.innerHTML = adviceHtml;
}

// 特性別アドバイス生成
function getAdviceForTrait(trait, score, person) {
    const isChild = person === 'child';
    
    switch(trait) {
        case 'extraversion':
            if (score > 70) {
                return isChild ? 
                    '社交的な性格を活かして、グループ活動やチームスポーツに参加すると良いでしょう' :
                    '社交的な性格を活かして、お子さんとの対話の時間を増やしましょう';
            } else if (score < 30) {
                return isChild ?
                    '内向的な性格を尊重し、一人で集中できる活動も大切にしましょう' :
                    '静かな環境でお子さんと向き合う時間を作りましょう';
            }
            break;
            
        case 'agreeableness':
            if (score > 70) {
                return isChild ?
                    '思いやりのある性格は素晴らしい長所です。時には自分の意見も大切にしましょう' :
                    '協調性の高さを活かして、家族の調和を保つ役割を担えます';
            }
            break;
            
        case 'conscientiousness':
            if (score > 70) {
                return isChild ?
                    '計画的で責任感が強い性格です。時には柔軟性も大切にしましょう' :
                    '計画性を活かして、お子さんに良い手本を示せます';
            } else if (score < 30) {
                return isChild ?
                    '自由な発想を大切にしながら、少しずつ計画性も身につけていきましょう' :
                    '柔軟性を活かしつつ、お子さんのために一定のルーティンも作りましょう';
            }
            break;
            
        case 'neuroticism':
            if (score > 60) {
                return isChild ?
                    'ストレスを感じやすいので、リラックスできる趣味や活動を見つけましょう' :
                    'ストレス管理を心がけ、お子さんの前では冷静さを保つよう努めましょう';
            }
            break;
            
        case 'openness':
            if (score > 70) {
                return isChild ?
                    '好奇心旺盛な性格を活かして、様々な体験や学習の機会を楽しみましょう' :
                    '新しいことへの興味を活かして、お子さんと一緒に冒険や発見を楽しみましょう';
            }
            break;
    }
    
    return null;
}

// 診断を続ける
function continueDiagnosis() {
    showScreen('selectPersonScreen');
}

// 結果をダウンロード
function downloadResult() {
    // Canvas要素を画像として保存
    const canvas = document.getElementById('radarChart');
    const url = canvas.toDataURL('image/png');
    
    // ダウンロードリンク作成
    const link = document.createElement('a');
    link.download = `family-personality-result-${Date.now()}.png`;
    link.href = url;
    link.click();
    
    // テキスト結果も保存
    let textResult = '親子の特性相性診断結果\n';
    textResult += '======================\n\n';
    
    Object.keys(results).forEach(person => {
        if (results[person]) {
            const personLabels = {
                mother: '母親',
                father: '父親',
                child: '子ども'
            };
            
            textResult += `【${personLabels[person]}の結果】\n`;
            Object.keys(results[person]).forEach(trait => {
                textResult += `${traitLabels[trait]}: ${results[person][trait]}点\n`;
            });
            textResult += '\n';
        }
    });
    
    // テキストファイルとして保存
    const blob = new Blob([textResult], { type: 'text/plain' });
    const textUrl = URL.createObjectURL(blob);
    const textLink = document.createElement('a');
    textLink.download = `family-personality-result-${Date.now()}.txt`;
    textLink.href = textUrl;
    textLink.click();
    
    alert('診断結果を保存しました！');
}

// リセット
function resetAll() {
    currentPerson = null;
    currentQuestionIndex = 0;
    answers = {};
    results = {
        mother: null,
        father: null,
        child: null
    };
    if (radarChart) {
        radarChart.destroy();
        radarChart = null;
    }
    showStartScreen();
}

// ページ読み込み完了時
document.addEventListener('DOMContentLoaded', function() {
    // 初期画面表示
    showStartScreen();
});