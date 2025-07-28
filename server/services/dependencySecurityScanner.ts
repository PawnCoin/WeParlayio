/**
 * Dependency Security Scanner for WeParlay
 * Monitors and reports on package vulnerabilities and security issues
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { logger } from './enhancedLoggingService';

export interface VulnerabilityReport {
  package: string;
  version: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  title: string;
  overview: string;
  recommendation: string;
  references?: string[];
  cwe?: string[];
  cvss?: number;
}

export interface SecurityScanResult {
  timestamp: string;
  vulnerabilities: VulnerabilityReport[];
  summary: {
    total: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  };
  outdatedPackages: Array<{
    package: string;
    current: string;
    wanted: string;
    latest: string;
  }>;
}

class DependencySecurityScanner {
  private readonly CRITICAL_SEVERITY_THRESHOLD = 7.0; // CVSS score
  private readonly SCAN_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private lastScanTime: number = 0;
  private cachedResults: SecurityScanResult | null = null;

  constructor() {
    // Schedule regular scans in production
    if (process.env.NODE_ENV === 'production') {
      this.scheduleRegularScans();
    }
  }

  /**
   * Perform comprehensive security scan
   */
  async performSecurityScan(): Promise<SecurityScanResult> {
    const now = Date.now();
    
    // Return cached results if scan was recent
    if (this.cachedResults && (now - this.lastScanTime) < this.SCAN_INTERVAL) {
      return this.cachedResults;
    }

    logger.info('Starting dependency security scan');

    try {
      const vulnerabilities = await this.scanForVulnerabilities();
      const outdatedPackages = await this.scanForOutdatedPackages();

      const summary = this.generateSummary(vulnerabilities);
      
      const result: SecurityScanResult = {
        timestamp: new Date().toISOString(),
        vulnerabilities,
        summary,
        outdatedPackages,
      };

      this.cachedResults = result;
      this.lastScanTime = now;

      // Log critical vulnerabilities immediately
      if (summary.critical > 0) {
        logger.error('Critical security vulnerabilities detected', {
          criticalCount: summary.critical,
          totalCount: summary.total,
        });

        // Alert on critical vulnerabilities
        this.alertOnCriticalVulnerabilities(vulnerabilities.filter(v => v.severity === 'critical'));
      }

      logger.info('Security scan completed', {
        totalVulnerabilities: summary.total,
        criticalVulnerabilities: summary.critical,
        outdatedPackages: outdatedPackages.length,
      });

      return result;
    } catch (error) {
      logger.error('Security scan failed', error);
      throw new Error('Failed to perform security scan');
    }
  }

  /**
   * Scan for known vulnerabilities using npm audit
   */
  private async scanForVulnerabilities(): Promise<VulnerabilityReport[]> {
    try {
      const auditOutput = execSync('npm audit --json', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const auditData = JSON.parse(auditOutput);
      const vulnerabilities: VulnerabilityReport[] = [];

      if (auditData.vulnerabilities) {
        Object.entries(auditData.vulnerabilities).forEach(([packageName, vuln]: [string, any]) => {
          vuln.via.forEach((advisory: any) => {
            if (typeof advisory === 'object' && advisory.title) {
              vulnerabilities.push({
                package: packageName,
                version: vuln.range || 'unknown',
                severity: advisory.severity,
                title: advisory.title,
                overview: advisory.overview || '',
                recommendation: this.generateRecommendation(advisory),
                references: advisory.references?.map((ref: any) => ref.url) || [],
                cwe: advisory.cwe || [],
                cvss: advisory.cvss?.score,
              });
            }
          });
        });
      }

      return vulnerabilities;
    } catch (error) {
      // npm audit exits with non-zero code when vulnerabilities are found
      // Try to parse the output anyway
      try {
        const errorOutput = (error as any).stdout || '';
        if (errorOutput) {
          const auditData = JSON.parse(errorOutput);
          return this.parseAuditData(auditData);
        }
      } catch (parseError) {
        logger.warn('Failed to parse npm audit output', parseError);
      }
      
      return [];
    }
  }

  /**
   * Parse audit data from npm audit output
   */
  private parseAuditData(auditData: any): VulnerabilityReport[] {
    const vulnerabilities: VulnerabilityReport[] = [];

    if (auditData.vulnerabilities) {
      Object.entries(auditData.vulnerabilities).forEach(([packageName, vuln]: [string, any]) => {
        if (vuln.via && Array.isArray(vuln.via)) {
          vuln.via.forEach((advisory: any) => {
            if (typeof advisory === 'object' && advisory.title) {
              vulnerabilities.push({
                package: packageName,
                version: vuln.range || 'unknown',
                severity: advisory.severity || 'moderate',
                title: advisory.title,
                overview: advisory.overview || '',
                recommendation: this.generateRecommendation(advisory),
                references: advisory.references?.map((ref: any) => ref.url) || [],
                cwe: advisory.cwe || [],
                cvss: advisory.cvss?.score,
              });
            }
          });
        }
      });
    }

    return vulnerabilities;
  }

  /**
   * Scan for outdated packages
   */
  private async scanForOutdatedPackages(): Promise<Array<{
    package: string;
    current: string;
    wanted: string;
    latest: string;
  }>> {
    try {
      const outdatedOutput = execSync('npm outdated --json', { 
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      const outdatedData = JSON.parse(outdatedOutput);
      
      return Object.entries(outdatedData).map(([packageName, info]: [string, any]) => ({
        package: packageName,
        current: info.current,
        wanted: info.wanted,
        latest: info.latest,
      }));
    } catch (error) {
      // npm outdated exits with non-zero code when outdated packages are found
      try {
        const errorOutput = (error as any).stdout || '';
        if (errorOutput) {
          const outdatedData = JSON.parse(errorOutput);
          return Object.entries(outdatedData).map(([packageName, info]: [string, any]) => ({
            package: packageName,
            current: info.current,
            wanted: info.wanted,
            latest: info.latest,
          }));
        }
      } catch (parseError) {
        logger.warn('Failed to parse npm outdated output', parseError);
      }
      
      return [];
    }
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(vulnerabilities: VulnerabilityReport[]): {
    total: number;
    critical: number;
    high: number;
    moderate: number;
    low: number;
  } {
    const summary = {
      total: vulnerabilities.length,
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
    };

    vulnerabilities.forEach(vuln => {
      summary[vuln.severity]++;
    });

    return summary;
  }

  /**
   * Generate recommendation based on advisory
   */
  private generateRecommendation(advisory: any): string {
    if (advisory.patched_versions && advisory.patched_versions !== '<0.0.0') {
      return `Update to version ${advisory.patched_versions}`;
    }
    
    if (advisory.recommendation) {
      return advisory.recommendation;
    }
    
    return 'Review this vulnerability and consider updating or replacing the package';
  }

  /**
   * Alert on critical vulnerabilities
   */
  private alertOnCriticalVulnerabilities(criticalVulns: VulnerabilityReport[]): void {
    criticalVulns.forEach(vuln => {
      logger.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'critical',
        context: { timestamp: new Date().toISOString() },
        details: {
          type: 'critical_vulnerability_detected',
          package: vuln.package,
          version: vuln.version,
          title: vuln.title,
          cvss: vuln.cvss,
          cwe: vuln.cwe,
        },
      });
    });
  }

  /**
   * Check if specific package has known vulnerabilities
   */
  async checkPackageSecurity(packageName: string, version?: string): Promise<VulnerabilityReport[]> {
    const scanResult = await this.performSecurityScan();
    return scanResult.vulnerabilities.filter(vuln => 
      vuln.package === packageName && (!version || vuln.version.includes(version))
    );
  }

  /**
   * Get security status for dashboard
   */
  async getSecurityStatus(): Promise<{
    status: 'secure' | 'warning' | 'critical';
    summary: SecurityScanResult['summary'];
    lastScanTime: string;
    recommendations: string[];
  }> {
    const scanResult = await this.performSecurityScan();
    
    let status: 'secure' | 'warning' | 'critical' = 'secure';
    if (scanResult.summary.critical > 0) {
      status = 'critical';
    } else if (scanResult.summary.high > 0 || scanResult.summary.moderate > 5) {
      status = 'warning';
    }

    const recommendations: string[] = [];
    
    if (scanResult.summary.critical > 0) {
      recommendations.push(`Fix ${scanResult.summary.critical} critical vulnerabilities immediately`);
    }
    
    if (scanResult.summary.high > 0) {
      recommendations.push(`Address ${scanResult.summary.high} high-severity vulnerabilities`);
    }
    
    if (scanResult.outdatedPackages.length > 10) {
      recommendations.push(`Update ${scanResult.outdatedPackages.length} outdated packages`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Dependencies are up to date and secure');
    }

    return {
      status,
      summary: scanResult.summary,
      lastScanTime: scanResult.timestamp,
      recommendations,
    };
  }

  /**
   * Schedule regular security scans
   */
  private scheduleRegularScans(): void {
    setInterval(async () => {
      try {
        await this.performSecurityScan();
      } catch (error) {
        logger.error('Scheduled security scan failed', error);
      }
    }, this.SCAN_INTERVAL);

    // Run initial scan after 5 minutes
    setTimeout(async () => {
      try {
        await this.performSecurityScan();
      } catch (error) {
        logger.error('Initial security scan failed', error);
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Generate security report for compliance
   */
  async generateComplianceReport(): Promise<{
    timestamp: string;
    scanResults: SecurityScanResult;
    compliance: {
      hasHighRiskVulnerabilities: boolean;
      hasCriticalVulnerabilities: boolean;
      outdatedDependencies: number;
      recommendations: string[];
      riskScore: number; // 0-100
    };
  }> {
    const scanResults = await this.performSecurityScan();
    
    const hasHighRiskVulnerabilities = scanResults.summary.high > 0;
    const hasCriticalVulnerabilities = scanResults.summary.critical > 0;
    const outdatedDependencies = scanResults.outdatedPackages.length;
    
    // Calculate risk score (0-100, higher is worse)
    let riskScore = 0;
    riskScore += scanResults.summary.critical * 25; // Critical = 25 points each
    riskScore += scanResults.summary.high * 10;     // High = 10 points each
    riskScore += scanResults.summary.moderate * 3;  // Moderate = 3 points each
    riskScore += scanResults.summary.low * 1;       // Low = 1 point each
    riskScore += Math.min(outdatedDependencies * 0.5, 20); // Outdated packages up to 20 points
    
    riskScore = Math.min(riskScore, 100); // Cap at 100
    
    const recommendations: string[] = [];
    if (hasCriticalVulnerabilities) {
      recommendations.push('URGENT: Fix all critical vulnerabilities immediately');
    }
    if (hasHighRiskVulnerabilities) {
      recommendations.push('Fix high-risk vulnerabilities within 7 days');
    }
    if (outdatedDependencies > 20) {
      recommendations.push('Update outdated dependencies to reduce attack surface');
    }
    if (riskScore < 20) {
      recommendations.push('Maintain current security practices');
    }

    return {
      timestamp: new Date().toISOString(),
      scanResults,
      compliance: {
        hasHighRiskVulnerabilities,
        hasCriticalVulnerabilities,
        outdatedDependencies,
        recommendations,
        riskScore,
      },
    };
  }
}

// Singleton instance
export const securityScanner = new DependencySecurityScanner();
export default securityScanner;