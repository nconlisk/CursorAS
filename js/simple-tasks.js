// Simple task functionality for basic tasks
class SimpleTask extends BaseTask {
    constructor(taskId) {
        super(taskId);
        this.taskId = taskId;
        this.initSimpleTask();
    }

    initSimpleTask() {
        const completeBtn = document.getElementById('completeBtn');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => {
                console.log(`Completing simple task: ${this.taskId}`);
                this.completeTask();
            });
        } else {
            console.error(`Complete button not found for task: ${this.taskId}`);
        }
    }
}

// Initialize simple tasks when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get task ID from the page title or URL
    const taskId = getTaskIdFromPage();
    if (taskId) {
        new SimpleTask(taskId);
    }
});

function getTaskIdFromPage() {
    // Try to get task ID from various sources
    const url = window.location.pathname;
    const filename = url.split('/').pop();
    const taskId = filename.replace('.html', '');
    
    console.log('Detected task ID:', taskId);
    return taskId;
}