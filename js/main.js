Vue.component('board', {
  data() {
    return {
      columns: JSON.parse(localStorage.getItem('columns')) || [
        { name: 'Запланированные', tasks: [] },
        { name: 'В работе', tasks: [] },
        { name: 'Тестирование', tasks: [] },
        { name: 'Выполненные', tasks: [] }
      ],
      newTask: {
        title: '',
        description: '',
        deadline: ''
      }
    }
  },
  methods: {
    addTask() {
      this.columns[0].tasks.push({
        id: Date.now(),
        title: this.newTask.title,
        description: this.newTask.description,
        created: new Date().toLocaleDateString(),
        deadline: this.formatDeadline(this.newTask.deadline)
      })
      this.newTask.title = ''
      this.newTask.description = ''
      this.newTask.deadline = ''
      this.saveTasks()
    },
    saveTasks() {
      localStorage.setItem('columns', JSON.stringify(this.columns))
    },
    formatDeadline(deadline) {
      const date = new Date(deadline)
      return date.toLocaleString()
    }
  },
  template: `
  <div class="board">
    <form @submit.prevent="addTask">
      <input id="taskTitle" name="taskTitle" v-model="newTask.title" placeholder="Введите заголовок задачи" required>
      <textarea id="taskDescription" name="taskDescription" v-model="newTask.description" placeholder="Введите описание задачи" required></textarea>
      <input id="taskDeadline" name="taskDeadline" v-model="newTask.deadline" type="datetime-local" placeholder="Введите дедлайн задачи" required>
      <button type="submit">Добавить задачу</button>
    </form>
    <column v-for="column in columns" :key="column.name" :column="column"></column>
  </div>
  `
})

Vue.component('card', {
  props: ['task'],
  template: `
  <div class="card">
    <div class="card-header">
      <h2>{{ task.title }}</h2>
    </div>
    <div class="card-body">
      <p>{{ task.description }}</p>
      <div>
        <p class="card-inscriptions">Дедлайн:</p>
        <p>{{ task.deadline }}</p>
      </div>
      <div>
        <p class="card-inscriptions">Дата создания:</p>
        <p> {{ task.created }}</p>
      </div>
      <div>
        <button @click="editTask(task)">Редактировать</button>
        <button @click="deleteTask(task)">Удалить</button>
      </div>
    </div>
  </div>
  `
})

Vue.component('column', {
  props: ['column'],
  template: `
  <div class="column">
    <h3>{{ column.name }}</h3>
    <card v-for="task in column.tasks" :key="task.id" :task="task"></card>
  </div>
  `
})

new Vue({ el: '#app' })








