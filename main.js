class Calendar {
    constructor() {
        this.currentDate = new Date();
        this.calendar = document.getElementById('calendar');
        this.modal = document.getElementById('taskModal');
        this.modalDate = document.getElementById('modalDate');
        this.tasksList = document.getElementById('tasksList');
        this.newTaskInput = document.getElementById('newTask');
        this.selectedDate = null;

        this.initializeEventListeners();
        this.renderCalendar();
    }

    initializeEventListeners() {
        document.getElementById('prevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('nextMonth').addEventListener('click', () => this.changeMonth(1));
        
        document.querySelector('.close').addEventListener('click', () => this.closeModal());
        document.getElementById('addTask').addEventListener('click', () => this.addNewTask());
        document.getElementById('saveTasksBtn').addEventListener('click', () => this.saveTasks());
        
        this.newTaskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNewTask();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.renderCalendar();
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Update month display
        const monthNames = ["January", "February", "March", "April", "May", "June",
                           "July", "August", "September", "October", "November", "December"];
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

        // Clear calendar
        this.calendar.innerHTML = '';

        // Get first day of month and total days
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Add empty cells for days before start of month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'day empty';
            this.calendar.appendChild(emptyDay);
        }

        // Add days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = day;
            
            const taskPreview = document.createElement('div');
            taskPreview.className = 'task-preview';
            
            // Load and display task preview
            const tasks = this.loadTasks(year, month, day);
            if (tasks.length > 0) {
                taskPreview.textContent = `${tasks.length} task${tasks.length === 1 ? '' : 's'}`;
            }

            dayElement.appendChild(dayNumber);
            dayElement.appendChild(taskPreview);

            dayElement.addEventListener('click', () => this.openModal(year, month, day));
            
            this.calendar.appendChild(dayElement);
        }
    }

    openModal(year, month, day) {
        this.selectedDate = { year, month, day };
        this.modalDate.textContent = `${month + 1}/${day}/${year}`;
        this.displayTasks();
        this.modal.style.display = 'block';
    }

    closeModal() {
        this.modal.style.display = 'none';
        this.selectedDate = null;
        this.renderCalendar(); // Update task previews
    }

    addNewTask() {
        const taskText = this.newTaskInput.value.trim();
        if (!taskText) return;

        const tasks = this.loadTasks(
            this.selectedDate.year,
            this.selectedDate.month,
            this.selectedDate.day
        );

        tasks.push({
            text: taskText,
            completed: false,
            id: Date.now()
        });

        this.saveTasks();
        this.displayTasks();
        this.newTaskInput.value = '';
    }

    displayTasks() {
        const tasks = this.loadTasks(
            this.selectedDate.year,
            this.selectedDate.month,
            this.selectedDate.day
        );

        this.tasksList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => {
                task.completed = checkbox.checked;
                this.saveTasks();
            });

            const text = document.createElement('span');
            text.textContent = task.text;
            if (task.completed) {
                text.style.textDecoration = 'line-through';
                text.style.color = '#888';
            }

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.addEventListener('click', () => {
                this.deleteTask(task.id);
            });

            li.appendChild(checkbox);
            li.appendChild(text);
            li.appendChild(deleteBtn);
            this.tasksList.appendChild(li);
        });
    }

    deleteTask(taskId) {
        const tasks = this.loadTasks(
            this.selectedDate.year,
            this.selectedDate.month,
            this.selectedDate.day
        );

        const updatedTasks = tasks.filter(task => task.id !== taskId);
        this.saveTasks(updatedTasks);
        this.displayTasks();
    }

    loadTasks(year, month, day) {
        const key = `tasks-${year}-${month}-${day}`;
        const tasksJSON = localStorage.getItem(key);
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    }

    saveTasks(tasks = null) {
        if (!this.selectedDate) return;
        
        const key = `tasks-${this.selectedDate.year}-${this.selectedDate.month}-${this.selectedDate.day}`;
        const tasksToSave = tasks || this.loadTasks(
            this.selectedDate.year,
            this.selectedDate.month,
            this.selectedDate.day
        );
        
        localStorage.setItem(key, JSON.stringify(tasksToSave));
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calendar();
});
