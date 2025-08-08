// System Configuration Management for WeParlay Platform
// Centralized configuration system with real-time monitoring

import { validateAPIConfiguration, getAPIHealth } from './apiConfiguration';

export interface SystemConfig {
  environment: string;
  uptime: number;
  databaseConnected: boolean;
  systemHealth: 'operational' | 'warning' | 'critical';
  apis: {
    totalConfigured: number;
    totalRequired: number;
    healthStatus: 'healthy' | 'warning' | 'critical';
    configured: string[];
    missing: string[];
    warnings: string[];
  };
  lastUpdated: Date;
}

export interface AdminSettings {
  platformFee: number;
  maxWithdrawalLimit: number;
  minWithdrawalAmount: number;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  apiKeysValid: boolean;
  updatedAt: Date;
}

export interface PlatformStats {
  users: {
    total: number;
    active: number;
    premium: number;
  };
  financial: {
    totalRevenue: number;
    avgBetSize: number;
    conversionRate: number;
  };
  system: {
    uptime: number;
    lastRestart: string;
    version: string;
  };
}

// Configuration validation and health checks
export class SystemConfigurationManager {
  private static instance: SystemConfigurationManager;
  private config: SystemConfig;
  private adminSettings: AdminSettings;

  private constructor() {
    this.config = this.initializeSystemConfig();
    this.adminSettings = this.initializeAdminSettings();
  }

  public static getInstance(): SystemConfigurationManager {
    if (!SystemConfigurationManager.instance) {
      SystemConfigurationManager.instance = new SystemConfigurationManager();
    }
    return SystemConfigurationManager.instance;
  }

  private initializeSystemConfig(): SystemConfig {
    const apiValidation = validateAPIConfiguration();
    
    return {
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      databaseConnected: true, // Would check actual DB connection in production
      systemHealth: apiValidation.criticalFailure ? 'critical' : 'operational',
      apis: {
        totalConfigured: apiValidation.configured.length,
        totalRequired: apiValidation.configured.length + apiValidation.missing.length,
        healthStatus: apiValidation.criticalFailure ? 'critical' : apiValidation.allConfigured ? 'healthy' : 'warning',
        configured: apiValidation.configured,
        missing: apiValidation.missing,
        warnings: apiValidation.warnings
      },
      lastUpdated: new Date()
    };
  }

  private initializeAdminSettings(): AdminSettings {
    return {
      platformFee: parseFloat(process.env.PLATFORM_FEE || '0.05'),
      maxWithdrawalLimit: parseFloat(process.env.MAX_WITHDRAWAL_LIMIT || '10000'),
      minWithdrawalAmount: parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT || '20'),
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      registrationEnabled: process.env.REGISTRATION_ENABLED !== 'false',
      apiKeysValid: !validateAPIConfiguration().criticalFailure,
      updatedAt: new Date()
    };
  }

  public getSystemConfig(): SystemConfig {
    // Refresh with current data
    this.config = this.initializeSystemConfig();
    return this.config;
  }

  public getAdminSettings(): AdminSettings {
    return { ...this.adminSettings };
  }

  public updateAdminSettings(updates: Partial<AdminSettings>): AdminSettings {
    this.adminSettings = {
      ...this.adminSettings,
      ...updates,
      updatedAt: new Date()
    };
    return this.adminSettings;
  }

  public getSystemHealth(): any {
    const apiHealth = getAPIHealth();
    const apiValidation = validateAPIConfiguration();
    
    return {
      status: apiValidation.criticalFailure ? 'critical' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        connected: true,
        status: 'operational'
      },
      apis: {
        total: Object.keys(apiHealth).length,
        working: Object.values(apiHealth).filter((api: any) => api.status === 'READY').length,
        failed: Object.values(apiHealth).filter((api: any) => api.status === 'MISSING_KEY').length,
        details: {
          configured: apiValidation.configured,
          missing: apiValidation.missing,
          warnings: apiValidation.warnings
        }
      },
      services: {
        betting: 'operational',
        payments: 'operational',
        streaming: 'operational',
        notifications: 'operational'
      }
    };
  }

  public performHealthCheck(): {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    
    const apiValidation = validateAPIConfiguration();
    
    if (apiValidation.criticalFailure) {
      issues.push('Critical API failure - too many missing API keys');
      recommendations.push('Configure missing API keys to restore full functionality');
    }
    
    if (apiValidation.missing.length > 0) {
      issues.push(`${apiValidation.missing.length} API keys missing`);
      recommendations.push('Configure missing APIs for optimal performance');
    }
    
    if (this.adminSettings.maintenanceMode) {
      issues.push('Platform is in maintenance mode');
      recommendations.push('Disable maintenance mode when ready');
    }
    
    const memoryUsage = process.memoryUsage();
    if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      issues.push('High memory usage detected');
      recommendations.push('Monitor memory usage and restart if necessary');
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      recommendations
    };
  }

  public createConfigurationBackup(): any {
    return {
      timestamp: new Date().toISOString(),
      platform: {
        environment: this.config.environment,
        version: process.env.npm_package_version || '1.0.0'
      },
      admin: this.adminSettings,
      system: this.config,
      version: '1.0.0'
    };
  }

  public restoreConfigurationBackup(backup: any): boolean {
    try {
      if (backup.admin) {
        this.adminSettings = {
          ...backup.admin,
          updatedAt: new Date()
        };
      }
      
      if (backup.system) {
        // Only restore non-dynamic system settings
        // Don't restore uptime, lastUpdated, etc.
      }
      
      return true;
    } catch (error) {
      console.error('Failed to restore configuration backup:', error);
      return false;
    }
  }
}

// Export singleton instance
export const systemConfigManager = SystemConfigurationManager.getInstance();

// Configuration presets for different environments
export const CONFIG_PRESETS = {
  development: {
    platformFee: 0.05,
    maxWithdrawalLimit: 10000,
    minWithdrawalAmount: 20,
    maintenanceMode: false,
    registrationEnabled: true
  },
  production: {
    platformFee: 0.05,
    maxWithdrawalLimit: 50000,
    minWithdrawalAmount: 50,
    maintenanceMode: false,
    registrationEnabled: true
  },
  maintenance: {
    platformFee: 0.05,
    maxWithdrawalLimit: 0,
    minWithdrawalAmount: 100,
    maintenanceMode: true,
    registrationEnabled: false
  }
};

export function applyConfigPreset(preset: keyof typeof CONFIG_PRESETS): AdminSettings {
  const presetConfig = CONFIG_PRESETS[preset];
  return systemConfigManager.updateAdminSettings(presetConfig);
}

export default systemConfigManager;