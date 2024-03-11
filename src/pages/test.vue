<template>
  <div>
    <label>Start:</label>
    <input type="text" v-model="startTime" @input="calculateDuration" />
    <br />
    <label>End:</label>
    <input type="text" v-model="endTime" @input="calculateDuration" />
    <br />
    <label>Duration:</label>
    <input type="text" v-model="duration" @input="calculateEndTime" />
  </div>
</template>

<script>
// 在 Vue3 组件中使用 timeCalculation 函数
import { ref } from 'vue';

export default {
  setup() {
    const startTime = ref('00:00:00:00');
    const endTime = ref('00:00:00:00');
    const operation = ref('addition'); // 默认为加法运算

    const result = ref(null);

    const calculateTime = () => {
      result.value = timeCalculation(startTime.value, endTime.value, operation.value);
    };

    return {
      startTime,
      endTime,
      operation,
      result,
      calculateTime
    };
  }
};

function timeCalculation(timeA, timeB, operation) {
  let timeArrayA = timeA.split(':').map(Number);
  let timeArrayB = timeB.split(':').map(Number);

  let millisecondsA = timeArrayA[0] * 3600000 + timeArrayA[1] * 60000 + timeArrayA[2] * 1000 + timeArrayA[3] * (1000/24);
  let millisecondsB = timeArrayB[0] * 3600000 + timeArrayB[1] * 60000 + timeArrayB[2] * 1000 + timeArrayB[3] * (1000/24);

  let resultMilliseconds;
  if (operation === 'addition') {
      resultMilliseconds = millisecondsA + millisecondsB;
  } else if (operation === 'subtraction') {
      resultMilliseconds = millisecondsA - millisecondsB;
  } else {
      return 'Error: Invalid operation';
  }

  if (resultMilliseconds < 0) {
      return 'Error: Result is negative';
  }

  let resultHours = Math.floor(resultMilliseconds / 3600000);
  resultMilliseconds %= 3600000;
  let resultMinutes = Math.floor(resultMilliseconds / 60000);
  resultMilliseconds %= 60000;
  let resultSeconds = Math.floor(resultMilliseconds / 1000);
  let resultMilliseconds24 = Math.floor((resultMilliseconds % 1000) / (1000/24));

  return `${resultHours}:${resultMinutes}:${resultSeconds}:${resultMilliseconds24}`;
}
</script>