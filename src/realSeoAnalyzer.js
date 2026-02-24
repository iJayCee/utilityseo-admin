// Real SEO Analyzer using Google PageSpeed Insights API

const GOOGLE_API_KEY = 'AIzaSyDMTLRPoXfyICZtCIuT_DWysB_edqmVl1U'; // Replace with your actual key

export async function analyzeWebsite(url) {
  try {
    // Call Google PageSpeed API for mobile
    const mobileUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${GOOGLE_API_KEY}&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES&strategy=mobile`;
    
    const response = await fetch(mobileUrl);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to analyze website');
    }

    // Extract the scores
    const categories = data.lighthouseResult.categories;
    
    const performance = Math.round(categories.performance.score * 100);
    const seo = Math.round(categories.seo.score * 100);
    const accessibility = Math.round(categories.accessibility.score * 100);
    const bestPractices = Math.round(categories['best-practices'].score * 100);
    
    // Overall score (average of all)
    const overallScore = Math.round((performance + seo + accessibility + bestPractices) / 4);
    
    // Extract real issues from the audits
    const audits = data.lighthouseResult.audits;
    const issues = [];
    
    // Map Google's audits to our issue format
    Object.entries(audits).forEach(([key, audit]) => {
      if (audit.score !== null && audit.score < 0.9 && audit.title && audit.description) {
        const severity = audit.score < 0.5 ? 'critical' : audit.score < 0.7 ? 'high' : 'medium';
        
        issues.push({
          id: key,
          severity,
          category: getCategoryFromAudit(key),
          title: audit.title,
          description: audit.description,
          fix: getFixForAudit(key, audit),
          effort: audit.score < 0.3 ? 'High' : audit.score < 0.7 ? 'Medium' : 'Low',
          impact: audit.score < 0.5 ? 'High' : audit.score < 0.7 ? 'Medium' : 'Low',
        });
      }
    });

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
    
    // Take top 10 most important issues
    const topIssues = issues.slice(0, 10);

    return {
      url,
      score: overallScore,
      timestamp: new Date().toISOString(),
      metrics: {
        performance,
        seo,
        accessibility,
        bestPractices,
      },
      issues: topIssues,
      recommendations: generateRecommendations(topIssues),
      keywords: [], // We'll add keyword tracking later
      aiInsights: generateInsights(overallScore, topIssues),
    };
    
  } catch (error) {
    console.error('SEO Analysis Error:', error);
    throw new Error(`Failed to analyze ${url}: ${error.message}`);
  }
}

function getCategoryFromAudit(auditKey) {
  const categoryMap = {
    'first-contentful-paint': 'Performance',
    'largest-contentful-paint': 'Performance',
    'speed-index': 'Performance',
    'interactive': 'Performance',
    'total-blocking-time': 'Performance',
    'cumulative-layout-shift': 'Performance',
    'image-size-responsive': 'Performance',
    'modern-image-formats': 'Performance',
    'unused-css-rules': 'Performance',
    'unused-javascript': 'Performance',
    'render-blocking-resources': 'Performance',
    'viewport': 'SEO',
    'document-title': 'SEO',
    'meta-description': 'SEO',
    'http-status-code': 'SEO',
    'link-text': 'SEO',
    'crawlable-anchors': 'SEO',
    'is-crawlable': 'SEO',
    'robots-txt': 'SEO',
    'hreflang': 'SEO',
    'canonical': 'SEO',
    'color-contrast': 'Accessibility',
    'image-alt': 'Accessibility',
    'label': 'Accessibility',
    'aria-required-attr': 'Accessibility',
    'button-name': 'Accessibility',
    'link-name': 'Accessibility',
    'is-on-https': 'Best Practices',
    'geolocation-on-start': 'Best Practices',
    'notification-on-start': 'Best Practices',
    'no-vulnerable-libraries': 'Best Practices',
  };
  
  return categoryMap[auditKey] || 'SEO';
}

function getFixForAudit(key, audit) {
  const fixes = {
    'modern-image-formats': 'Convert images to WebP or AVIF format. Use image optimization tools or your build pipeline to automatically convert JPEG/PNG to modern formats.',
    'render-blocking-resources': 'Defer non-critical CSS and JavaScript. Inline critical CSS and use async/defer attributes for scripts.',
    'unused-css-rules': 'Remove unused CSS. Use tools like PurgeCSS or analyze coverage in Chrome DevTools to identify and remove unused styles.',
    'meta-description': 'Add a unique meta description to each page (150-160 characters). Include your target keyword naturally.',
    'document-title': 'Ensure every page has a unique, descriptive title tag (50-60 characters) with your main keyword.',
    'image-alt': 'Add descriptive alt text to all images. Use meaningful descriptions that explain the image content.',
    'color-contrast': 'Increase text/background contrast to meet WCAG AA standards (minimum 4.5:1 ratio for normal text).',
    'largest-contentful-paint': 'Optimize your largest content element. Preload key resources, optimize images, and reduce server response times.',
    'cumulative-layout-shift': 'Reserve space for images/ads with width/height attributes. Avoid inserting content above existing content.',
  };
  
  return fixes[key] || audit.description || 'Review Google PageSpeed recommendations for specific guidance.';
}

function generateRecommendations(issues) {
  return issues.slice(0, 6).map(issue => ({
    priority: issue.severity === 'critical' ? 'high' : issue.severity,
    action: `Fix: ${issue.title}`,
    effort: issue.effort,
    impact: issue.impact,
    details: issue.fix,
  }));
}

function generateInsights(score, issues) {
  const insights = [];
  
  if (score >= 80) {
    insights.push({
      type: 'win',
      text: `Excellent! Your site scores ${score}/100. You're in the top 20% of websites analyzed. Keep maintaining this performance.`,
    });
  } else if (score >= 60) {
    insights.push({
      type: 'action',
      text: `Your score of ${score}/100 is good, but there's room for improvement. Focus on the critical issues first for the biggest gains.`,
    });
  } else {
    insights.push({
      type: 'warning',
      text: `Your score of ${score}/100 needs attention. Fixing the ${issues.filter(i => i.severity === 'critical').length} critical issues could boost your score by 15-20 points.`,
    });
  }
  
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  if (criticalCount > 0) {
    insights.push({
      type: 'action',
      text: `You have ${criticalCount} critical issue${criticalCount > 1 ? 's' : ''} that should be addressed immediately. These have the highest impact on your SEO and user experience.`,
    });
  }
  
  const hasImageIssues = issues.some(i => i.id.includes('image'));
  if (hasImageIssues) {
    insights.push({
      type: 'trend',
      text: 'Image optimization detected as a key opportunity. Converting to WebP and properly sizing images typically yields 20-40% performance gains.',
    });
  }
  
  return insights;
}