<template>
  <!-- <transition name="fade"> -->
  <div>
    <ul v-if="visible" :style="{left:x+'px',top:y+'px'}" class="context-menu">
      <slot v-if="slotContent" name="content"></slot>
      <!-- <li>
        {{ $t('tagsView.refresh') }}
      </li>
      <li>
        {{ $t('tagsView.close') }}
      </li>
      <li>
        {{ $t('tagsView.closeOthers') }}
      </li>
      <li>
        {{ $t('tagsView.closeAll') }}
      </li> -->
    </ul>
  </div>
  <!-- </transition> -->
</template>

<script>
export default {
  props: {
    // visible: { type: Boolean, default: false }
    left: { type: Number, default: 0 },
    top: { type: Number, default: 0 },
    data: null
  },
  data() {
    return {
      x: 0,
      y: 0,
      visible: false
    }
  },
  watch: {
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu)
      } else {
        document.body.removeEventListener('click', this.closeMenu)
      }
    }
  },
  computed: {
    slotContent() {
      // console.log(this.$slots['content'])
      return this.$slots['content'] || false
    }
  },
  methods: {
    openMenu(data, e) {
      const menuMinWidth = 105
      const offsetLeft = this.$el.getBoundingClientRect().left // container margin left
      const offsetWidth = this.$el.offsetWidth // container width
      const maxLeft = offsetWidth - menuMinWidth // left boundary
      const left = e.clientX - offsetLeft + 15 // 15: margin right

      if (left > maxLeft) this.x = maxLeft + this.left
      else this.x = left + this.left

      this.y = e.clientY + this.top
      this.visible = true
      this.$emit('update:data', data)
    },
    closeMenu() {
      this.visible = false
    }
  }
}
</script>
<style scoped>
.context-menu {
  /* // transition: ease-out 0.5s; */
  margin: 0;
  background: #fff;
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: #333;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);
}
.context-menu li {
  margin: 0;
  padding: 7px 16px;
  cursor: pointer;
}
.context-menu li:hover {
  background: #eee;
}
/* .fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
} */
/* .fade-leave-active below version 2.1.8 */
/* .fade-enter, .fade-leave-to  {
  opacity: 0;
} */
</style>
