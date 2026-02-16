import { db, auth } from '../firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { ResultsEngine } from '../js/results_engine.js';

const engine = new ResultsEngine();

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            window.location.href = '../sign in/signin.html';
            return;
        }
        await initResults(user.uid);
    });
});

async function initResults(uid) {
    try {
        await engine.init();
        
        const resultsRef = doc(db, 'tests_results', uid);
        const resultsSnap = await getDoc(resultsRef);
        
        if (!resultsSnap.exists() || !resultsSnap.data().bigFive) {
            document.getElementById('resultsLoading').innerHTML = `
                <div class="alert alert-warning">
                    لم نجد نتائج لاختبار العوامل الخمسة. <a href="../Test/Test.html?test=Big-Five">ابدأ الاختبار الآن</a>
                </div>
            `;
            return;
        }

        const bigFiveData = resultsSnap.data().bigFive;
        if (!bigFiveData || !bigFiveData.scores) {
            throw new Error('Big Five scores are missing in data');
        }
        
        renderTraits(bigFiveData.scores);
        
        console.log('[PersonalityResults] Showing content...');
        document.getElementById('resultsLoading').style.display = 'none';
        document.getElementById('resultsContent').style.display = 'block';
        
        // Final heartbeat check to ensure it stays visible
        setTimeout(() => {
            const content = document.getElementById('resultsContent');
            const loading = document.getElementById('resultsLoading');
            console.log('[PersonalityResults] Heartbeat check:', {
                contentDisplay: content.style.display,
                loadingDisplay: loading.style.display,
                contentChildren: content.innerHTML.length
            });
            if (content.style.display === 'none') {
                console.warn('[PersonalityResults] Content was hidden! Re-showing...');
                content.style.display = 'block';
            }
        }, 1000);
    } catch (error) {
        console.error('[PersonalityResults] Error:', error);
        document.getElementById('resultsLoading').innerHTML = `
            <div class="alert alert-danger">حدث خطأ أثناء تحميل النتائج. يرجى المحاولة لاحقاً. <br><small>${error.message}</small></div>
        `;
    }
}

function renderTraits(scores) {
    const container = document.getElementById('traitsContainer');
    const descriptions = engine.getBigFiveDescriptions();
    
    const traits = [
        { key: 'O', name: 'الانفتاح (Openness)' },
        { key: 'C', name: 'التفاني (Conscientiousness)' },
        { key: 'E', name: 'الانبساط (Extraversion)' },
        { key: 'A', name: 'التوافق (Agreeableness)' },
        { key: 'N', name: 'العصابية (Neuroticism)' }
    ];
    container.innerHTML = traits.map(trait => {
        const score = scores[trait.key] || 0;
        return `
            <div class="trait-card fade-in visible">
                <div class="trait-title">
                    <span>${trait.name}</span>
                    <span class="trait-percentage">${score}%</span>
                </div>
                <div class="progress">
                    <div class="progress-bar" role="progressbar" style="width: ${score}%" aria-valuenow="${score}" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
                <p class="trait-description">${descriptions[trait.key] || ''}</p>
            </div>
        `;
    }).join('');
}
