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
        deadline: '',
        returnReason: null
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
        deadline: this.formatDeadline(this.newTask.deadline),
        returnReason: this.newTask.returnReason,
        status: ''
      })
      this.newTask.title = ''
      this.newTask.description = ''
      this.newTask.deadline = ''
      this.newTask.returnReason = null
      this.saveTasksLocale()
    },
    deleteTask(task) {
      const columnIndex = this.columns.findIndex(column => column.tasks.includes(task))
      if (columnIndex !== -1) {
        const taskIndex = this.columns[columnIndex].tasks.indexOf(task)
        if (taskIndex !== -1) {
          this.columns[columnIndex].tasks.splice(taskIndex, 1)
          this.saveTasksLocale()
        }
      }
    },
    saveTasksLocale() {
      localStorage.setItem('columns', JSON.stringify(this.columns))
    },
    formatDeadline(deadline) {
      const date = new Date(deadline)
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    },
    moveTaskLeft(task) {
      const columnIndex = this.columns.findIndex(column => column.tasks.includes(task));

      if (columnIndex > 0) {
        if (columnIndex === 2 && !task.returnReason) {
          alert('Вы сможете перенести эту задачу во второй столбец, когда укажите причину возврата, нажав на кнопку редактировать');
          return;
        }
        const taskIndex = this.columns[columnIndex].tasks.indexOf(task);
        this.columns[columnIndex].tasks.splice(taskIndex, 1);
        this.columns[columnIndex - 1].tasks.push(task);
        if (columnIndex === 2) {
          task.returnReasonEditing = true;
        }
        if (columnIndex === 3) {
          task.status = '';
        }
        this.saveTasksLocale();
      }
    },
    moveTaskRight(task) {
      const columnIndex = this.columns.findIndex(column => column.tasks.includes(task));
      if (columnIndex < this.columns.length - 1) {
        const taskIndex = this.columns[columnIndex].tasks.indexOf(task);
        this.columns[columnIndex].tasks.splice(taskIndex, 1);
        this.columns[columnIndex + 1].tasks.push(task);
        if (columnIndex === 1) {
          task.returnReasonEditing = false;
          task.returnReason = null;
        }
        if (columnIndex === 2) {
          const deadlineParts = task.deadline.split(' ');
          if (deadlineParts.length === 2) {
            const [date, time] = deadlineParts;
            const dateParts = date.split('.');
            if (dateParts.length === 3) {
              const [day, month, year] = dateParts;
              const deadline = new Date(`${year}-${month}-${day}T${time}`);
              const now = new Date();
              if (isNaN(deadline.getTime())) {
                console.error('Неправильный формат дедлайна:', task.deadline);
              } else {
                task.status = now.getTime() > deadline.getTime() ? 'Просрочено' : 'Выполнено в срок';
              }
            }
          }
        }
        this.saveTasksLocale();
      }
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
    <column v-for="(column, index) in columns" :key="column.name" :format-deadline="formatDeadline" :column="column" :deleteTask="deleteTask" :saveTasksLocale="saveTasksLocale" :index="index" @moveTaskLeft="moveTaskLeft" @moveTaskRight="moveTaskRight"></column>
  </div>
  `
})

Vue.component('card', {
  props: ['task', 'deleteTask', 'saveTasksLocale', 'columnIndex', 'formatDeadline'],
  data() {
    return {
      editing: false,
      returnReasonEditing: false,
      editedTask: {
        title: '',
        description: '',
        deadline: '',
        returnReason: null
      }
    }
  },
  methods: {
    editTask() {
      this.editing = true;
      this.editedTask.title = this.task.title;
      this.editedTask.description = this.task.description;
      this.editedTask.returnReason = this.task.returnReason;
      this.returnReasonEditing = this.columnIndex === 2;
    
      if (this.task.deadline) {
        let currentDeadline = new Date(this.task.deadline);
        // Преобразуем дату к формату YYYY-MM-DD и установим в поле редактирования
        this.editedTask.deadline = currentDeadline.toISOString().split('T')[0];
      } else {
        this.editedTask.deadline = this.deadline; 
      }
    },
  saveTask() {
    if (!this.editedTask.deadline) {
      delete this.editedTask.deadline;
    } else {
      this.task.title = this.editedTask.title;
      this.task.description = this.editedTask.description;
      this.task.deadline = this.formatDeadline(this.editedTask.deadline);
      this.task.lastEdited = new Date().toLocaleString();
      this.editing = false;
      this.task.returnReason = this.editedTask.returnReason;
      this.returnReasonEditing = false;
      this.saveTasksLocale();
      if (this.editedTask.returnReason && this.columnIndex === 2) {
        this.$emit('moveTaskLeft', this.task);
      }
    }
  },
  },
  template: `
  <div class="card">
    <div v-if="!editing" class="card-header">
      <h2>{{ task.title }}</h2>
    </div>
    <div v-if="!editing" class="card-body">
      <p class="card-inscriptions-p" >{{ task.description }}</p>
      <div>
        <p class="card-inscriptions">Дедлайн:</p>
        <p class="card-inscriptions-p" >{{ task.deadline }}</p>
      </div>
      <div>
        <p class="card-inscriptions">Дата создания:</p>
        <p class="card-inscriptions-p" > {{ task.created }}</p>
      </div>
      <div v-if="task.returnReason">
        <p class="card-inscriptions">Причина возврата:</p>
        <p class="card-inscriptions-p" @click="editTask">{{ task.returnReason }}</p>
      </div>
      <div class= "last-edit" v-if="task.lastEdited">
        <p class="card-inscriptions">Последнее редактирование:</p>
        <p class="card-inscriptions-p" > {{ task.lastEdited }}</p>
      </div>
      <div v-if="task.status">
        <p class="card-inscriptions">Статус:</p>
        <p class="card-inscriptions-p">{{ task.status }}</p>
      </div>
      <div>
        <button @click="editTask">Редактировать</button>
        <button @click="deleteTask(task)">Удалить</button>
      </div>
      <div>
        <button v-if="columnIndex === 2" class="btn-move" @click="$emit('moveTaskLeft', task)">&lt;</button>
        <button class="btn-move"  @click="$emit('moveTaskRight', task)">&gt;</button>
      </div>
    </div>
    <div v-if="editing || returnReasonEditing" class="card-edit">
      <input v-model="editedTask.title" placeholder="Введите заголовок задачи" required>
      <textarea v-model="editedTask.description" placeholder="Введите описание задачи" required></textarea>
      <input v-model="editedTask.deadline" type="datetime-local" placeholder="Введите дедлайн задачи" required>
      <input v-if="returnReasonEditing" v-model="editedTask.returnReason" placeholder="Введите причину возврата">
      <button @click="saveTask">Сохранить</button>
    </div>
  </div>
  `
})

Vue.component('column', {
  props: ['column', 'deleteTask', 'saveTasksLocale', 'index', 'formatDeadline'],
  template: `
  <div class="column">
    <h3>{{ column.name }}</h3>
    <card v-for="task in column.tasks" :key="task.id" :task="task" :deleteTask="deleteTask" :saveTasksLocale="saveTasksLocale" :columnIndex="index" :format-deadline="formatDeadline" @moveTaskLeft="$emit('moveTaskLeft', task)" @moveTaskRight="$emit('moveTaskRight', task)"></card>
  </div>
  `
})

new Vue({ el: '#app' })








