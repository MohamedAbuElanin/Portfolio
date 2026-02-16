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
        
        if (!resultsSnap.exists() || !resultsSnap.data().holland) {
            document.getElementById('resultsLoading').innerHTML = `
                <div class="alert alert-warning">
                    لم نجد نتائج لاختبار هولاند. <a href="../Test/Test.html?test=Holland">ابدأ الاختبار الآن</a>
                </div>
            `;
            return;
        }

        const hollandData = resultsSnap.data().holland;
        if (!hollandData || !hollandData.scores) {
            throw new Error('Holland scores are missing in data');
        }

        const careerContent = engine.getHollandContent(hollandData.scores);
        if (!careerContent) {
            throw new Error('Failed to map Holland scores to career content');
        }
        
        renderCareer(careerContent);
        
        console.log('[CareerResults] Showing content...');
        document.getElementById('resultsLoading').style.display = 'none';
        document.getElementById('resultsContent').style.display = 'block';

        // Final heartbeat check
        setTimeout(() => {
            const content = document.getElementById('resultsContent');
            if (content.style.display === 'none') {
                console.warn('[CareerResults] Content hidden! Re-showing...');
                content.style.display = 'block';
            }
        }, 1000);
    } catch (error) {
        console.error('[CareerResults] Error:', error);
        document.getElementById('resultsLoading').innerHTML = `
            <div class="alert alert-danger">حدث خطأ أثناء تحميل النتائج. يرجى المحاولة لاحقاً. <br><small>${error.message}</small></div>
        `;
    }
}

function renderCareer(content) {
    const hollandTraitNames = {
        'R': 'الواقعي',
        'I': 'الاستقصائي',
        'A': 'الفني',
        'S': 'الاجتماعي',
        'E': 'المبادر',
        'C': 'التقليدي'
    };

    const translatedCode = content.top_traits.map(t => hollandTraitNames[t] || t).join(' - ');
    document.getElementById('hollandCodeBadge').textContent = `النمط المهني: ${translatedCode} (${content.code})`;
    document.getElementById('careerTitle').textContent = content.title;
    document.getElementById('careerDescription').textContent = content.description;
    document.getElementById('salaryRange').textContent = content.salary_range;

    // Helper to render list
    const renderList = (elementId, items) => {
        const el = document.getElementById(elementId);
        el.innerHTML = items.map(item => `<li>${item}</li>`).join('');
    };

    renderList('jobsList', content.jobs);
    renderList('coursesList', content.courses);
    renderList('booksList', content.books);
}
