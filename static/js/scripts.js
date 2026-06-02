const content_dir = 'contents/'
const section_names = ['home', 'awards', 'projects', 'experience', 'publications'];
const languageStorageKey = 'homepage-language';
const languageFiles = {
    en: {
        config: 'config.yml',
        sectionSuffix: ''
    },
    zh: {
        config: 'config.zh.yml',
        sectionSuffix: '.zh'
    }
};
let activeLanguage = 'en';
const uiText = {
    en: {
        'nav-home': 'HOME',
        'nav-awards': 'AWARDS',
        'nav-projects': 'PROJECTS',
        'nav-experience': 'EXPERIENCE',
        'nav-publications': 'PUBLICATIONS',
        course: 'Course',
        score: 'Score',
        courseCount: count => `${count} courses`,
        summaryLabel: 'Academic summary'
    },
    zh: {
        'nav-home': '首页',
        'nav-awards': '荣誉',
        'nav-projects': '项目',
        'nav-experience': '经历',
        'nav-publications': '论文',
        course: '课程',
        score: '成绩',
        courseCount: count => `${count} 门课程`,
        summaryLabel: '学业概览'
    }
};


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

    document.querySelectorAll('.language-option').forEach(button => {
        button.addEventListener('click', () => setLanguage(button.dataset.lang));
    });

    marked.use({ mangle: false, headerIds: false })
    setLanguage(getInitialLanguage());
});

function getInitialLanguage() {
    const savedLanguage = localStorage.getItem(languageStorageKey);
    if (savedLanguage && languageFiles[savedLanguage]) return savedLanguage;

    return navigator.language && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
}

function setLanguage(language) {
    const nextLanguage = languageFiles[language] ? language : 'en';
    activeLanguage = nextLanguage;
    localStorage.setItem(languageStorageKey, nextLanguage);
    document.documentElement.lang = nextLanguage === 'zh' ? 'zh-CN' : 'en';
    updateLanguageButtons(nextLanguage);
    updateStaticText(nextLanguage);
    loadConfig(nextLanguage);
    loadSections(nextLanguage);
}

function updateLanguageButtons(language) {
    document.querySelectorAll('.language-option').forEach(button => {
        const isActive = button.dataset.lang === language;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
}

function updateStaticText(language) {
    const dictionary = uiText[language] || uiText.en;
    Object.keys(dictionary).forEach(key => {
        if (typeof dictionary[key] !== 'string') return;

        document.querySelectorAll(`[data-i18n="${key}"]`).forEach(element => {
            element.textContent = dictionary[key];
        });
    });
}

function loadConfig(language) {
    fetch(content_dir + languageFiles[language].config)
        .then(response => {
            if (!response.ok && language !== 'en') {
                return fetch(content_dir + languageFiles.en.config);
            }
            return response;
        })
        .then(response => response.text())
        .then(text => {
            if (activeLanguage !== language) return;

            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));
}

function loadSections(language) {
    section_names.forEach((name, idx) => {
        const localizedPath = content_dir + name + languageFiles[language].sectionSuffix + '.md';
        const fallbackPath = content_dir + name + '.md';

        fetch(localizedPath)
            .then(response => {
                if (!response.ok && language !== 'en') {
                    return fetch(fallbackPath);
                }
                return response;
            })
            .then(response => response.text())
            .then(markdown => {
                if (activeLanguage !== language) return;

                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
                if (name === 'home') {
                    enhanceAcademicProfile(language);
                }
            }).then(() => {
                // MathJax
                if (window.MathJax) {
                    MathJax.typeset();
                }
            })
            .catch(error => console.log(error));
    })
}

function enhanceAcademicProfile(language) {
    const home = document.getElementById('home-md');
    if (!home) return;

    const educationHeading = Array.from(home.querySelectorAll('h4')).find(
        heading => ['education', '教育经历'].includes(heading.textContent.trim().toLowerCase())
    );
    if (!educationHeading) return;

    const educationList = educationHeading.nextElementSibling;
    if (!educationList || educationList.tagName !== 'UL') return;

    const items = Array.from(educationList.querySelectorAll(':scope > li'));
    const metricLabels = new Set(['GPA', 'Average Score', 'Ranking', '平均成绩', '专业排名']);
    const courseLabels = {
        'Main courses of Computer Science': 'Computer Science',
        'Main courses of Remote Sensing & GIS': 'Remote Sensing & GIS',
        'Main courses of Geography': 'Geography',
        'Other interests': 'Other Interests',
        '计算机科学主修课程': '计算机科学',
        '遥感与地理信息系统主修课程': '遥感与地理信息系统',
        '地理学主修课程': '地理学',
        '其他兴趣课程': '其他兴趣'
    };
    const metrics = [];
    const courseGroups = [];

    items.forEach(item => {
        const strong = item.querySelector('strong');
        if (!strong) return;

        const label = strong.textContent.replace(/\s+/g, ' ').trim().replace(/:$/, '').replace(/\uFF1A$/, '');
        const text = item.textContent.replace(/\s+/g, ' ').trim();
        const value = text.replace(strong.textContent, '').replace(/^[:\uFF1A]\s*/, '').trim();

        if (metricLabels.has(label)) {
            metrics.push({ label, value });
            item.remove();
            return;
        }

        if (courseLabels[label]) {
            const courses = value
                .replace(/[.\u3002]$/, '')
                .split(/[;\uFF1B]/)
                .map(course => parseCourseWithGrade(course))
                .filter(course => course.name);

            if (courses.length) {
                courseGroups.push({ title: courseLabels[label], courses });
                item.remove();
            }
        }
    });

    if (metrics.length) {
        const summary = document.createElement('div');
        summary.className = 'academic-summary';
        summary.setAttribute('aria-label', uiText[language].summaryLabel);

        metrics.forEach(metric => {
            const card = document.createElement('div');
            card.className = 'academic-metric';
            card.innerHTML = `<span>${escapeHtml(metric.label)}</span><strong>${escapeHtml(metric.value)}</strong>`;
            summary.appendChild(card);
        });

        educationHeading.insertAdjacentElement('afterend', summary);
    }

    if (courseGroups.length) {
        const panel = document.createElement('div');
        panel.className = 'course-panel';

        courseGroups.forEach(group => {
            const groupNode = document.createElement('section');
            groupNode.className = 'course-group';
            groupNode.innerHTML = `
                <div class="course-group-header">
                    <h5>${escapeHtml(group.title)}</h5>
                    <span>${escapeHtml(uiText[language].courseCount(group.courses.length))}</span>
                </div>
                <div class="course-table" role="table" aria-label="${escapeHtml(group.title)} courses">
                    <div class="course-row course-row-head" role="row">
                        <span role="columnheader">${escapeHtml(uiText[language].course)}</span>
                        <span role="columnheader">${escapeHtml(uiText[language].score)}</span>
                    </div>
                </div>
            `;

            const table = groupNode.querySelector('.course-table');
            group.courses.forEach(course => {
                const row = document.createElement('div');
                row.className = `course-row${course.grade ? '' : ' course-row-missing-grade'}`;
                row.setAttribute('role', 'row');
                row.innerHTML = `
                    <span class="course-name" role="cell">${escapeHtml(course.name)}</span>
                    <span class="course-score" role="cell">${escapeHtml(course.grade || '--')}</span>
                `;
                table.appendChild(row);
            });

            panel.appendChild(groupNode);
        });

        educationList.insertAdjacentElement('afterend', panel);
    }
}

function parseCourseWithGrade(rawCourse) {
    const normalized = rawCourse.replace(/\s+/g, ' ').trim();
    if (!normalized) return { name: '', grade: '' };

    const parenMatch = normalized.match(/^(.+?)\s*[\uFF08(]\s*([A-F][+-]?|P|Pass|[0-9]{1,3}(?:\.[0-9]+)?(?:\/100)?)\s*[\uFF09)]$/i);
    if (parenMatch) {
        return { name: parenMatch[1].trim(), grade: parifyGrade(parenMatch[2]) };
    }

    const separatorMatch = normalized.match(/^(.+?)\s+(?:-|--|:|\uFF1A)\s*([A-F][+-]?|P|Pass|[0-9]{1,3}(?:\.[0-9]+)?(?:\/100)?)$/i);
    if (separatorMatch) {
        return { name: separatorMatch[1].trim(), grade: parifyGrade(separatorMatch[2]) };
    }

    return { name: normalized, grade: '' };
}

function parifyGrade(grade) {
    return grade.trim().replace(/^pass$/i, 'Pass');
}

function escapeHtml(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
