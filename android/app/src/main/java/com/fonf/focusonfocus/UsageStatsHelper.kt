package com.fonf.focusonfocus

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import java.util.Calendar

data class AppUsageInfo(
    val packageName: String,
    val totalTimeInForegroundMs: Long
)

class UsageStatsHelper(private val context: Context) {

    fun getTodayAppUsage(): List<AppUsageInfo> {
        val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val statsList: List<UsageStats> = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        ) ?: emptyList()

        return statsList
            .filter { it.totalTimeInForeground > 0 }
            .map { AppUsageInfo(it.packageName, it.totalTimeInForeground) }
            .sortedByDescending { it.totalTimeInForegroundMs }
    }
}
