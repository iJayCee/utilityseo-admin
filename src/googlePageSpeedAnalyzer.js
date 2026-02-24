/**
 * Google PageSpeed Insights API Integration
 * Provides real SEO scores from Google
 */

const PAGESPEED_API_KEY = import.meta.env.VITE_GOOGLE_PAGESPEED_API_KEY || '';
const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export async function analyzeWebsite(url) {
  if (!PAGESPEED_API_KEY) {
    throw new Error('Google PageSpeed API key not configured. Add VITE_GOOGLE_PAGESPEED_API_KEY to your .env file');
  }

  try {
    // Fetch both mobile and desktop data
    const [mobileResponse, desktopResponse] = await Promise.all([
      fetch(`${PAGESPEED_API_URL}?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&category=performance&category=seo&category=accessibility&category=best-practices&strategy=mobile`),
      fetch(`${PAGESPEED_API_URL}?url=${encodeURIComponent(url)}&key=${PAGESPEED_API_KEY}&category=performance&category=seo&category=accessibility&category=best-practices&strategy=desktop`)
    ]);

    if (!mobileResponse.ok) {
      const error = await mobileResponse.json();
      throw new Error(error.error?.message || 'Failed to fetch PageSpeed data');
    }

    const mobileData = await mobileResponse.json();
    const desktopData = await desktopResponse.json();

    // Extract lighthouse results (average mobile + desktop)
    const mobileLighthouse = mobileData.lighthouseResult;
    const desktopLighthouse = desktopData.lighthouseResult;

    // Calculate scores (0-100)
    const mobileScores = mobileLighthouse.categories;
    const desktopScores = desktopLighthouse.categories;

    const performance = Math.round((mobileScores.performance.score * 100 + desktopScores.performance.score * 100) / 2);
    const seo = Math.round((mobileScores.seo.score * 100 + desktopScores.seo.score * 100) / 2);
    const accessibility = Math.round((mobileScores.accessibility.score * 100 + desktopScores.accessibility.score * 100) / 2);
    const bestPractices = Math.round((mobileScores['best-practices'].score * 100 + desktopScores['best-practices'].score * 100) / 2);

    const overallScore = Math.round((performance + seo + accessibility + bestPractices) / 4);

    // Extract issues from audits
    const issues = extractIssues(mobileLighthouse.audits, desktopLighthouse.audits);

    // Extract metrics
    const metrics = {
      performance,
      seo,
      accessibility,
      bestPractices
    };

    return {
      url,
      score: overallScore,
      metrics,
      issues,
      keywords: [], // Keywords would come from Search Console integration
      aiInsights: generateInsights(overallScore, metrics, issues)
    };

  } catch (error) {
    console.error('PageSpeed API Error:', error);
    throw new Error(`Failed to analyze website: ${error.message}`);
  }
}

function extractIssues(mobileAudits, desktopAudits) {
  const issues = [];
  let issueId = 1;

  // Define which audits to check and their categories
  const auditChecks = {
    // Performance
    'largest-contentful-paint': { category: 'Performance', severity: 'critical' },
    'first-contentful-paint': { category: 'Performance', severity: 'high' },
    'speed-index': { category: 'Performance', severity: 'high' },
    'interactive': { category: 'Performance', severity: 'high' },
    'total-blocking-time': { category: 'Performance', severity: 'medium' },
    'cumulative-layout-shift': { category: 'Performance', severity: 'medium' },
    'render-blocking-resources': { category: 'Performance', severity: 'high' },
    'unminified-css': { category: 'Performance', severity: 'medium' },
    'unminified-javascript': { category: 'Performance', severity: 'medium' },
    'unused-css-rules': { category: 'Performance', severity: 'medium' },
    'unused-javascript': { category: 'Performance', severity: 'medium' },
    'modern-image-formats': { category: 'Performance', severity: 'medium' },
    'uses-optimized-images': { category: 'Performance', severity: 'medium' },
    'uses-responsive-images': { category: 'Performance', severity: 'low' },
    
    // SEO
    'document-title': { category: 'SEO', severity: 'critical' },
    'meta-description': { category: 'SEO', severity: 'high' },
    'link-text': { category: 'SEO', severity: 'medium' },
    'crawlable-anchors': { category: 'SEO', severity: 'high' },
    'is-crawlable': { category: 'SEO', severity: 'critical' },
    'robots-txt': { category: 'SEO', severity: 'medium' },
    'hreflang': { category: 'SEO', severity: 'low' },
    'canonical': { category: 'SEO', severity: 'high' },
    'font-size': { category: 'SEO', severity: 'medium' },
    'tap-targets': { category: 'SEO', severity: 'medium' },
    
    // Accessibility
    'color-contrast': { category: 'Accessibility', severity: 'medium' },
    'image-alt': { category: 'Accessibility', severity: 'high' },
    'aria-required-attr': { category: 'Accessibility', severity: 'high' },
    'aria-valid-attr': { category: 'Accessibility', severity: 'high' },
    'button-name': { category: 'Accessibility', severity: 'medium' },
    'link-name': { category: 'Accessibility', severity: 'medium' },
    'label': { category: 'Accessibility', severity: 'medium' },
    
    // Best Practices
    'errors-in-console': { category: 'Best Practices', severity: 'low' },
    'image-aspect-ratio': { category: 'Best Practices', severity: 'low' },
    'uses-http2': { category: 'Best Practices', severity: 'medium' },
    'uses-passive-event-listeners': { category: 'Best Practices', severity: 'low' },
  };

  // Check each audit
  Object.entries(auditChecks).forEach(([auditKey, config]) => {
    const mobileAudit = mobileAudits[auditKey];
    const desktopAudit = desktopAudits[auditKey];

    // If either mobile or desktop fails, add it as an issue
    if ((mobileAudit && mobileAudit.score !== null && mobileAudit.score < 0.9) ||
        (desktopAudit && desktopAudit.score !== null && desktopAudit.score < 0.9)) {
      
      const audit = mobileAudit || desktopAudit;
      
      issues.push({
        id: issueId++,
        severity: config.severity,
        category: config.category,
        title: audit.title,
        description: audit.description || 'See details for more information',
        fix: getFixRecommendation(auditKey, audit),
        effort: getEffortLevel(config.severity),
        impact: getImpactLevel(config.severity)
      });
    }
  });

  return issues;
}

function getFixRecommendation(auditKey, audit) {
  const fixes = {
    'document-title': 'Add a descriptive <title> tag to your page. Keep it under 60 characters and include your primary keyword.',
    'meta-description': 'Add a <meta name="description"> tag with a compelling 150-160 character description.',
    'image-alt': 'Add alt text to all images. Describe the image content for screen readers and SEO.',
    'render-blocking-resources': 'Defer non-critical CSS and JavaScript. Use async/defer attributes on script tags.',
    'modern-image-formats': 'Convert images to WebP or AVIF format for better compression.',
    'unused-css-rules': 'Remove unused CSS or split it into critical and non-critical parts.',
    'unused-javascript': 'Remove or lazy-load unused JavaScript code.',
    'color-contrast': 'Increase contrast ratio to at least 4.5:1 for normal text and 3:1 for large text.',
    'uses-http2': 'Enable HTTP/2 on your server for better performance.',
    'largest-contentful-paint': 'Optimize your largest content element (usually an image or text block). Aim for under 2.5s.',
    'cumulative-layout-shift': 'Add width and height attributes to images and reserve space for dynamic content.',
  };

  return fixes[auditKey] || audit.description || 'Review the audit details and follow Google\'s recommendations.';
}

function getEffortLevel(severity) {
  const effortMap = {
    'critical': 'Medium',
    'high': 'Medium',
    'medium': 'Low',
    'low': 'Low'
  };
  return effortMap[severity] || 'Medium';
}

function getImpactLevel(severity) {
  const impactMap = {
    'critical': 'High',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low'
  };
  return impactMap[severity] || 'Medium';
}

function generateInsights(score, metrics, issues) {
  const insights = [];

  // Performance insights
  if (metrics.performance < 50) {
    insights.push({
      type: 'warning',
      text: `Your performance score is ${metrics.performance}/100. This could significantly impact user experience and SEO rankings. Focus on optimizing images and reducing JavaScript.`
    });
  } else if (metrics.performance >= 90) {
    insights.push({
      type: 'win',
      text: `Excellent performance score of ${metrics.performance}/100! Your site loads quickly, which improves user experience and search rankings.`
    });
  }

  // SEO insights
  if (metrics.seo < 80) {
    const criticalSeoIssues = issues.filter(i => i.category === 'SEO' && i.severity === 'critical').length;
    insights.push({
      type: 'action',
      text: `You have ${criticalSeoIssues} critical SEO issues. Fixing these could significantly improve your search visibility.`
    });
  } else if (metrics.seo >= 95) {
    insights.push({
      type: 'win',
      text: `Your SEO fundamentals are solid with a ${metrics.seo}/100 score. Keep monitoring and maintaining these standards.`
    });
  }

  // Accessibility insights
  if (metrics.accessibility < 70) {
    insights.push({
      type: 'warning',
      text: `Accessibility score is ${metrics.accessibility}/100. Improving this will help more users access your content and may improve SEO.`
    });
  }

  // Overall insights
  const criticalIssues = issues.filter(i => i.severity === 'critical').length;
  if (criticalIssues > 0) {
    insights.push({
      type: 'action',
      text: `You have ${criticalIssues} critical issues to address. Prioritize these for maximum impact on your site's performance and rankings.`
    });
  }

  if (score >= 90) {
    insights.push({
      type: 'win',
      text: `Outstanding overall score of ${score}/100! Your site follows Google's best practices. Continue monitoring to maintain this quality.`
    });
  }

  return insights;
}
