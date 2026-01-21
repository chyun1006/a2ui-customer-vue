<template>
  <div :class="['chart-container', className]">
    <v-chart :option="chartOption" :style="{ height }" autoresize />
  </div>
</template>

<script setup>
import { computed } from "vue";
import VChart from "vue-echarts";
import { use } from "echarts/core";
import { PieChart, LineChart, BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

// 按需注册 ECharts 组件
use([
  PieChart,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

const props = defineProps({
  chartType: {
    type: String,
    required: true,
    validator: (value) => ["pie", "line", "bar"].includes(value),
  },
  chartData: {
    type: Object,
    required: true,
  },
  chartOptions: {
    type: Object,
    default: () => ({}),
  },
  className: {
    type: String,
    default: "",
  },
  height: {
    type: String,
    default: "300px",
  },
});

// 主题配置
const theme = {
  color: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"],
  textStyle: {
    fontFamily: "Inter, -apple-system, sans-serif",
    fontSize: 12,
    color: "#64748b",
  },
};

// 根据图表类型生成配置
const chartOption = computed(() => {
  const { chartType, chartData, chartOptions } = props;

  let option = {
    ...theme,
    ...chartOptions,
  };

  switch (chartType) {
    case "pie":
      option = {
        ...option,
        title: {
          text: chartData.title || "",
          left: "center",
          textStyle: {
            fontSize: 14,
            fontWeight: "bold",
            color: "#1e293b",
          },
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        },
        legend: {
          orient: "horizontal",
          bottom: "0",
          textStyle: {
            fontSize: 11,
            color: "#64748b",
          },
        },
        series: [
          {
            name: chartData.title || "数据",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 8,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 16,
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: chartData.data || [],
          },
        ],
      };
      break;

    case "line":
      option = {
        ...option,
        title: {
          text: chartData.title || "",
          left: "center",
          textStyle: {
            fontSize: 14,
            fontWeight: "bold",
            color: "#1e293b",
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985",
            },
          },
        },
        legend: {
          bottom: "0",
          textStyle: {
            fontSize: 11,
            color: "#64748b",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "15%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: chartData.xAxis || [],
          axisLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisLabel: {
            color: "#64748b",
            fontSize: 11,
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisLabel: {
            color: "#64748b",
            fontSize: 11,
          },
          splitLine: {
            lineStyle: {
              color: "#f1f5f9",
            },
          },
        },
        series: (chartData.series || []).map((s) => ({
          name: s.name,
          type: "line",
          smooth: true,
          data: s.data,
          areaStyle: {
            opacity: 0.1,
          },
          emphasis: {
            focus: "series",
          },
        })),
      };
      break;

    case "bar":
      option = {
        ...option,
        title: {
          text: chartData.title || "",
          left: "center",
          textStyle: {
            fontSize: 14,
            fontWeight: "bold",
            color: "#1e293b",
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        legend: {
          bottom: "0",
          textStyle: {
            fontSize: 11,
            color: "#64748b",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "15%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: chartData.xAxis || [],
          axisLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisLabel: {
            color: "#64748b",
            fontSize: 11,
          },
        },
        yAxis: {
          type: "value",
          axisLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisLabel: {
            color: "#64748b",
            fontSize: 11,
          },
          splitLine: {
            lineStyle: {
              color: "#f1f5f9",
            },
          },
        },
        series: (chartData.series || []).map((s) => ({
          name: s.name,
          type: "bar",
          data: s.data,
          barWidth: "60%",
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
          emphasis: {
            focus: "series",
          },
        })),
      };
      break;
  }

  return option;
});
</script>

<style scoped>
.chart-container {
  background: white;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}
</style>
