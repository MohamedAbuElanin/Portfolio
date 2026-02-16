/**
 * Results Engine - Deterministic Mapping for SIA
 * Maps test scores to content from results_mapping.json
 */

export class ResultsEngine {
    constructor() {
        this.mapping = null;
    }

    async init() {
        try {
            console.log('[ResultsEngine] Initializing...');
            const response = await fetch('../data/results_mapping.json');
            if (!response.ok) {
                throw new Error(`Failed to load results mapping: ${response.status} ${response.statusText}`);
            }
            this.mapping = await response.json();
            console.log('[ResultsEngine] Mapping loaded successfully');
        } catch (error) {
            console.error('[ResultsEngine] Error loading mapping:', error);
            throw error;
        }
    }

    /**
     * Map Holland scores to career data
     * @param {Object} scores - { R, I, A, S, E, C }
     * @returns {Object} - Career content
     */
    getHollandContent(scores) {
        if (!this.mapping || !this.mapping.holland_mapping) {
            console.error('[ResultsEngine] Mapping not initialized or missing holland_mapping');
            return null;
        }

        if (!scores || typeof scores !== 'object') {
            console.warn('[ResultsEngine] Invalid scores provided to getHollandContent');
            return this.mapping.holland_mapping['DEFAULT'];
        }

        // Get top 3 letters
        const sorted = Object.entries(scores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
        
        const code = sorted.join('');
        console.log('[ResultsEngine] Holland Code:', code);

        // Try exact match, then fallback to DEFAULT
        const content = this.mapping.holland_mapping[code] || this.mapping.holland_mapping['DEFAULT'];
        
        if (!content) {
            console.error('[ResultsEngine] Could not find content for code or DEFAULT');
            return null;
        }

        return {
            ...content,
            code: code,
            top_traits: sorted
        };
    }

    /**
     * Get Big Five descriptions
     * @returns {Object}
     */
    getBigFiveDescriptions() {
        return this.mapping ? this.mapping.big_five_descriptions : {};
    }

    /**
     * Generate combined final analysis
     * @param {Object} hollandScores 
     * @param {Object} bigFiveScores 
     */
    generateFinalAnalysis(hollandScores, bigFiveScores) {
        if (!this.mapping) {
            return { career: { title: 'مستشار مهني' }, analysisText: 'جاري تحميل التحليل...' };
        }

        const career = this.getHollandContent(hollandScores);
        const b5Desc = this.getBigFiveDescriptions();

        if (!career || !bigFiveScores) {
            return { 
                career: career || { title: 'محلل مهني' }, 
                analysisText: 'أكمل الاختبارات للحصول على تحليل شامل يتضمن رؤى شخصية ومهنية.' 
            };
        }

        const hollandTraitNames = {
            'R': 'الواقعي (Realistic)',
            'I': 'الاستقصائي (Investigative)',
            'A': 'الفني (Artistic)',
            'S': 'الاجتماعي (Social)',
            'E': 'المبادر (Enterprising)',
            'C': 'التقليدي (Conventional)'
        };

        const b5TraitNames = {
            'O': 'الانفتاح',
            'C': 'التفاني',
            'E': 'الانبساط',
            'A': 'التوافق',
            'N': 'العصابية'
        };

        // Get top Big Five traits
        const sortedB5 = Object.entries(bigFiveScores)
            .sort((a, b) => b[1] - a[1])
            .filter(entry => entry[1] > 50); // High traits only

        const topB5Keys = sortedB5.map(e => b5TraitNames[e[0]]);
        const hTraits = career.top_traits.map(t => hollandTraitNames[t]);

        // Structured analysis
        let analysis = `بناءً على التقييم الشامل، تم تحديد المسار الأنسب لك وهو: **${career.title}**.\n\n`;
        
        analysis += `### التحليل المهني (نموذج هولاند):\n`;
        analysis += `تتميز شخصيتك المهنية بمزيج فريد من المهارات: **${hTraits.join('، ')}**. وهذا يعني أنك ${career.description}\n\n`;

        analysis += `### السمات الشخصية المعززة:\n`;
        if (topB5Keys.length > 0) {
            analysis += `تظهر نتائجك أنك تتميز بـ (${topB5Keys.join(' و ')})، مما يدعم نجاحك في هذا المجال من خلال: ${b5Desc[sortedB5[0][0]]}\n\n`;
        } else {
            analysis += `تظهر شخصيتك توازناً جيداً في العوامل الخمسة الكبرى، مما يمنحك مرونة عالية في بيئة العمل.\n\n`;
        }

        analysis += `### نصيحة الخبراء:\n`;
        analysis += `لتحقيق أقصى استفادة من قدراتك، ننصحك بالتركيز على الدورات التدريبية المقترحة والاطلاع على الكتب المختارة لتعميق خبرتك في هذا المجال.`;

        return {
            career: career,
            analysisText: analysis
        };
    }
}
