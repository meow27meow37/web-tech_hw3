const BASE_URL = 'https://inai-col1.fishrungames.com';

document.getElementById('applicationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const studentId = document.getElementById('studentId').value.trim();
    const buildingNum = document.getElementById('buildingNum').value.trim();
    const roomNum = document.getElementById('roomNum').value.trim();

    const resultDiv = document.getElementById('result');
    resultDiv.style.display = 'block';
    resultDiv.className = '';
    resultDiv.textContent = 'Загрузка и проверка данных...';

    try {
        const [studentRes, buildingRes, roomRes] = await Promise.all([
            fetch(`${BASE_URL}/students/${studentId}`),
            fetch(`${BASE_URL}/buildings/${buildingNum}`),
            fetch(`${BASE_URL}/rooms/${roomNum}`)
        ]);

        if (!studentRes.ok || !buildingRes.ok || !roomRes.ok) {
            resultDiv.className = 'error';
            resultDiv.textContent = 'Отказ: Одно или несколько введенных ID не найдены в системе (404 Not Found).';
            return;
        }

        const student = await studentRes.json();
        const building = await buildingRes.json();
        const room = await roomRes.json();

        const isStudentOk = student.isOutofTown ?? student.is_outof_town ?? student.isNonResident ?? student.is_non_resident ?? (typeof student.resident === 'boolean' ? !student.resident : undefined);
        const isBuildingOk = building.forStudents ?? building.for_students ?? building.isForStudents ?? building.is_for_students;
        const isRoomOk = room.isFree ?? room.is_free ?? room.free ?? room.available;

        const reasons = [];

        if (isStudentOk !== true) {
            reasons.push('Студент не является иногородним');
        }
        if (isBuildingOk !== true) {
            reasons.push('Корпус не предназначен для студентов');
        }
        if (isRoomOk !== true) {
            reasons.push('Комната не свободна');
        }

        if (reasons.length === 0) {
            resultDiv.className = 'success';
            resultDiv.textContent = 'Успешно! Все условия совпадают, заявка одобрена.';
        } else {
            resultDiv.className = 'error';
            resultDiv.textContent = 'Отказ: ' + reasons.join(', ') + '.';
        }

    } catch (error) {
        console.error(error);
        resultDiv.className = 'error';
        resultDiv.textContent = 'Ошибка сети или бэкенд недоступен.';
    }
});