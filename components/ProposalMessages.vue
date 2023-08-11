<template>
  <div>
    <div v-for="message in messages" :key="message.content.title">
      {{ message.content.title }}
      <br /><br />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    messages: Array, // Prop to pass the messages data
  },
};
</script>