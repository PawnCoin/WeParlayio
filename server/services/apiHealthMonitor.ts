class ApiHealthMonitor {
  private exhaustedApis = new Set<string>();
  private quotaResetTimes = new Map<string, number>();

  markApiExhausted(apiName: string, resetTimeHours: number = 24) {
    this.exhaustedApis.add(apiName);
    this.quotaResetTimes.set(apiName, Date.now() + (resetTimeHours * 60 * 60 * 1000));
    console.log(`🚫 API ${apiName} marked as exhausted, quota resets in ${resetTimeHours}h`);
  }

  isApiAvailable(apiName: string): boolean {
    if (!this.exhaustedApis.has(apiName)) {
      return true;
    }

    const resetTime = this.quotaResetTimes.get(apiName);
    if (resetTime && Date.now() > resetTime) {
      this.exhaustedApis.delete(apiName);
      this.quotaResetTimes.delete(apiName);
      console.log(`✅ API ${apiName} quota has reset, re-enabling`);
      return true;
    }

    return false;
  }

  getExhaustedApis(): string[] {
    return Array.from(this.exhaustedApis);
  }
}

export const apiHealthMonitor = new ApiHealthMonitor();

// Mark known exhausted APIs
apiHealthMonitor.markApiExhausted('rapidapi-basketball');
apiHealthMonitor.markApiExhausted('rapidapi-odds');