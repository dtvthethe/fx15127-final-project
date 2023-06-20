export const modalShow = (idElement) => {
    const el = document.getElementById(idElement);
    el.style.display = 'block';
    el.classList.add('show');
}

export const modalHide = (idElement) => {
    const el = document.getElementById(idElement);
    el.style.display = 'none';
    el.classList.remove('idElement');
}
