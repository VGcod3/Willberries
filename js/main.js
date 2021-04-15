const mySwiper = new Swiper('.swiper-container', {
	loop: true,

	// Navigation arrows
	navigation: {
		nextEl: '.slider-button-next',
		prevEl: '.slider-button-prev',
	},
});

//------------------------------------------------------------------------------------------------------

const buttonCart = document.querySelector('.button-cart');
const modalCart = document.querySelector('#modal-cart');
const modalClose = document.querySelector('.modal-close');

//у нас есть навигация и при нажатии на соответствующую кнопку будут выходить товары
const navigationLink = document.querySelectorAll('.navigation-link:not(.view-all)'); //все линки ищем кроме .view-all 
const longGoodsList = document.querySelector('.long-goods-list');
const viewAll = document.querySelectorAll('.view-all');  //добавили отдельный класс кот выводит все товары. Нужно только добавить

// нужно на эти кнопки при нажатии открывался данный каталог товаров
const showClothing = document.querySelectorAll('.show-clother');
const showAcsess = document.querySelectorAll('.show-acsesory');

//Работа с корзиной
const cartTableGoods = document.querySelector('.cart-table__goods');  //оболочка всей корзины куда будут выводится товары
const cardTableTotal = document.querySelector('.card-table__total');  //итоговая сумма
const clearAllBasket = document.querySelector('.clear-basket');  //кнопка очищения всей корзины
const cartCound = document.querySelector('.cart-count');

//пишим функцию кот будит получать данные с сервера. Сервером будит явл уже готовый файл  db/db.json
//эту функцию поднимаем сюда (она была ниже) в самое начало, т.к. функция будит использоваться не только для отображения карточек
//но и для формирования нашей корзины

//пишим асинхронную функци. Чтоб функция стала асинхронной, то нужно напис слово async
//и после этого мы внутри функции может исопльзовать ключевое слово  await
//слово await говорит:,,Подожди пока выполнится выражение то кот напсиано справо от await
//и потом только продолжай выполнять код дальше. fetch делает запрос и возвращает промис
//Промис - это обещание что нам прийдет ответ от сервера хороший или плохой
//Промис мы можем обрабатывать.Промис вернется сразу в result
// Вариант1 
// const getGoods = async () => {
// 	const result = await fetch('db/db.json');
// 	//console.log(result); //ok:true; statys:200;
// 	if(!result.ok) {  //если будит result.ok равен false то мы выполним throw
// 		throw 'Oшибочка вышла: ' + result.status; //throw-это исключение. мы сами вызовем ошибку в браузере
// 	}
// 	return await result.json(); //можно еще использовать метод text() если формат не .json
// };
// console.log(getGoods());  //пришел промис с обьктами товаров в массиве 
// //промисы обрабатывают с помощью метода then
// getGoods().then(function (data) {  //принимает в нее данные функции кот мы сюда передаем, она выполниться только тогда когда then выполнится
// 	console.log(data);
// });


//Вариант 2 через замыкания. Функция высшего порядка.
const checkGoods = () => {

	const data = [];

	return async () => {
		if(data.length) return data;

		const result = await fetch('db/db.json');
		if(!result.ok) {
			throw 'Oшибочка вышла: ' + result.status; 
		}
		data.push(...(await result.json()));

		return data;
	};
};
const getGoods = checkGoods();
//можно напис короче
// fetch('db/db.json')
// 	.then(function(response) {
// 		return response.json(); здесб допис ошибки
// 	})
// 	.then(function(data) {
// 		console.log(data);
// 	});

//Работа с корзиной--------------------------------------------------------------------------------------------------------
// Создаем свой метод для работы с корзиной. Это обьект, в кот описываем наши действия
// const cart = {
// 	cartGoods: [],
// countQuantity() {},   //складівает количество
// clearCart() {},  //очищает всю корзину
// 	renderCart(){},  //метод кот выводит т-р на стр
// 	deleteGood(id){},  //наш крестик кот удаляет позиции с корзины
// 	minusGood(id){},  //отнимает кол-во в корзине
// 	plusGood(id){},  //добавляем кол-во в корзине
// 	addCartGoods(id){},  //Добавление т-в в корзину. пишу запятую тк когда нужно будит что-то добавить чтоб не возвращаться
// };

const cart = {
	cartGoods: [
		//это мы писали обьекты чтоб проверять отправку локально, не через файл .json
		// {
		// 	id: '099',
		// 	name: 'Dior',
		// 	price: 10,
		// 	count: 2,
		// },
		// {
		// 	id: '090',
		// 	name: 'Addidas',
		// 	price: 9,
		// 	count: 3,
		// }
	],
		//-----------------Считает сколько т-в в корзине 
		// countQuantity() {
		// 	const totalCount = this.cartGoods.reduce((sum, item) => {
		// 		return sum + item.count;
		// 	},0);
		// 	cartCound.textContent = totalCount;
		// },
			//-----------вариант 2 как записать

	countQuantity() {
		const count = this.cartGoods.reduce((sum, item) => {
			return sum + item.count;
		},0);
		//делаем проверку что когда товаров в корзине 0, то если count вернет какое-то число
		//то он его и будит записывать в textContent. А если будит 0 - а это false значит будит выведенв в textContent пустая строка
		cartCound.textContent = count ? count : '';
	},

	clearCart() {
		//this.cartGoods = []; //не лучший способ
		this.cartGoods.length = 0;
		this.countQuantity();
		this.renderCart();
	},

	renderCart(){
		cartTableGoods.textContent = '';
		this.cartGoods.forEach(({id, name, price, count}) => {  //можем обратиться cart.cartGoods.forEach(() но если нужно будит изменить имя обьекта то прийдется менять везде. Поэтому используем this
			const trGood = document.createElement('tr');  //блок где 1 т-р описан. он сверстан, но потом его убирем и будим рендерить в корзину
			trGood.className = 'cart-item';  //этот класс есть в верстке
			trGood.dataset.id = id;
     //создаем карточкку т-ра. Перекопируем верстку item товара сюда
			trGood.innerHTML = `
				<td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>${price * count}$</td>
				<td><button class="cart-btn-delete">x</button></td>
			`;
			cartTableGoods.append(trGood);
		});
// Reduce() перебор массива . Он в отличии от map, forEach, filter, он в текущей функции кот у нас внутри он принимает на один аргумент больше.
// Если обычный forEach принимает сперва элемент, индекс и потом массив кот будит перебирать. То  Reduce первым эл принимает аккумулятор. 
// Аккумулятор – это то куда он все складывает и передает далее в след итерацию цикла. Аккумулятор(sum) мы получаем всегда от той функции кот завершилась до этого. 
//считаем общую сумму покупки
		const totalPrice = this.cartGoods.reduce((sum, item) => {
			return sum + item.price * item.count; //отработает первая итерация с первой позицией. Это Dior 2 шт по 10у.е.
			//10*2 = 20у.е. И эти 20у.е. вернется (return) в sum.
			//Потом следующая итерация пойдет с Адидас. Там 9 у.е. * 2шт = 27у.е.
			//в sum уже есть число 20 и добавляется еще число 27. Оно суммируется. Т.к. у нас всего 2 позиции то перебор завершится и все попадет 
			//в переменную const totalPrice
		},0);
		//и теперь totalPrice выведим на стр.
		cardTableTotal.textContent = totalPrice + '$';
	},


	//если у нас id совпадает с item.id то он не вернется в this.cartGoods
	deleteGood(id){
		this.cartGoods = this.cartGoods.filter(item => id !== item.id);
		//после выполняем перерендер
		this.renderCart();
		this.countQuantity();
	},  
	minusGood(id){
		for(const item of this.cartGoods) {
			if(item.id === id) { 
				if(item.count <= 1) { //если меньше 1 
					// this.deleteGood(id); то можно т-р удалить
					this.renderCart(id); //или оставить с отметкой 1
				} else {
					item.count--;
				}
				break;
			}
		}
		this.renderCart();
		this.countQuantity();
	},
	plusGood(id){
		for(const item of this.cartGoods) {
			if(item.id === id) { //если совпали наши id то добавляем 1
				item.count++;
				break;
			}
		}
		this.renderCart();
		this.countQuantity();
	},

	addCartGoods(id){
 //Сразу нужно проверить нет ли этого т-ра в корзине. Когда метод find найдет нужный эл
 //он его же вернет в переменную const goodItem 
		const goodItem = this.cartGoods.find(item => item.id === id);
		if(goodItem) {
			this.plusGood(id); //будит добавляться еще один эл. Можно пис напрямую this.goodItem++ но он будит
			//сохранять только местно. И на беке и в локал сторедже не изменится.
		} else { //если эл нет в нашей базе то получать будим с сервера
			getGoods()
				.then(data => data.find(item => item.id === id)) //если находим то передаем в след then
				.then(({ id, name, price }) => {
					this.cartGoods.push({
						id,
						name,
						price,
						count: 1
					});
					this.countQuantity();
				});
		}
	}, 
	
};

clearAllBasket.addEventListener('click', () => {
	cart.clearCart();   //cart.clearCart.bind(cart) 2вариант напси вместо стрелочной функции
});

//при нажатии на любую карточку т-ра она должна добавиться в корзину. Но их много и навешивать каждому не выйдет
//кликаем три раза - значит трижды должен добавиться товар. И чтоб все работало можем навешать событие на тег body
document.body.addEventListener('click', e => {
	const addToCart = e.target.closest('.add-to-cart'); //ищем нужный класс при нажатии. тк если проверять в if наличие класса
	//то не всегда выходит т.к. внутри кнопки может быть span и при попадании на него не будит срабатывать
	//.closest поднимается до родителя и при нажатии в кнопке на span т-р все равно добавляется. если жмем вокруг - то будит null 
	if(addToCart) { //проверяю его наличи
		cart.addCartGoods(addToCart.dataset.id);
	}
});

//--------------------------------------------------------------------------------------

//навешиваем событие на всю корзину. Отслеживаем куда кликнули
cartTableGoods.addEventListener('click', (e) => {
	const target = e.target;  //записываем это отслеживание в переменную
	if (target.classList.contains('cart-btn-delete')) { //если там где кликнули сожержится класс cart-btn-delete
		const parent = target.closest('.cart-item'); //проверяю есть ли у нажатой кнопки родитель с классом .cart-item . 
		//closest ищет по селектору поэтому в скобкам пишем точку. Если нет этого класса то поднимись выше и поищи у верхнего
		//родителя и так далее пока не найдет эл с этим классом. Если поднявшись до document не найдет его, то он 
		//вернет null - пустоту. Но т.к. мы знаем что у нас есть кнопки .cart-btn-delete с родителем .cart-item то найдем
		//и теперь через роидтеля обращаемся к dataset.id 
		cart.deleteGood(parent.dataset.id);
	}
	//можно написать короче:
	// if(target.classList.contains('cart-btn-delete')) {
	// 	const id = target.closest('.cart-item').dataset.id;
	// 	cart.deleteGood(id);
	// }
	if (target.classList.contains('cart-btn-minus')) {
		const id = target.closest('.cart-item').dataset.id;
		cart.minusGood(id);
	}
	if (target.classList.contains('cart-btn-plus')) {
		const id = target.closest('.cart-item').dataset.id;
		cart.plusGood(id);
	}

	//--------Условие можно пис по разному. Вариант 2
	//мы проверяем что у нас кнопка. Если нажатое место равно тегу кнопка
	// if(target.tagName === 'BUTTON') {
	// 	const id = target.closest('.cart-item').dataset.id;   	//в этом случае получаю наш id 
	// 	//и внутри кода можем проверять какая имеено была нажата кнопка
	// 	if(target.classList.contains('cart-btn-delete')) {
	// 		cart.deleteGood(id);
	// 	}
	// 	if (target.classList.contains('cart-btn-minus')) {
	// 		cart.minusGood(id);
	// 	}
	// 	if (target.classList.contains('cart-btn-plus')) {
	// 		cart.plusGood(id);
	// 	}
	// }
});


//открываем/закрываем окно корзины ------------------------------------------------------------------------
//и когда будит открывать корзину вызываем метод рендеринга корзины cart.renderCart();
const openModal = () => {
	cart.renderCart();
	modalCart.classList.add('show');   //show add in overlay. When they together: dispplay:flex
};

const closeModal = () => {
	modalCart.classList.remove('show'); //when show del - overlay is diplay:none
};

buttonCart.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);

modalCart.addEventListener('click', (e) => {
	const target  = e.target;
	if(target.classList.contains('overlay') || target.classList.contains('modal-close')) {
		closeModal();
	}
});

//-----------------------------------------------------------------------------------------------------------

//scroll smooth плавный скролл

{
// 	const scrollLinks = document.querySelectorAll('a.scroll-link');

// for(let i = 0; i < scrollLinks.length; i++) {
// 	 scrollLinks[i].addEventListener('click', function(e) {
// 		e.preventDefault();
// 		const id = scrollLinks[i].getAttribute('href');  //получаем атрибут href, это #body
// 		//нужно найти эл до котого нужно докрутить. Его не пишем в переменную, т.к. не будим боьше использовать
// 		//scrollIntoView() - метод кот написан в JS
// 		document.querySelector(id).scrollIntoView({
// 			//scrollIntoView принимает параметры, одни из них
// 			behavior: 'smooth',
// 			block: 'start' //до куда будим крутить
// 		});
// 	});
// }
// }

//Second method without for(let i)
//чтоб при нажатии не только выводились все товары но и скролило вверх, используем класс scroll-link тк 
//функция уже написана <a href="#body" чтоб подниалось
const scrollLinks = document.querySelectorAll('a.scroll-link');

for(const scrollLink of scrollLinks) {
	 scrollLink.addEventListener('click', e => {
		e.preventDefault();
		const id = scrollLink.getAttribute('href'); 
		document.querySelector(id).scrollIntoView({
			behavior: 'smooth',
			block: 'start' 
		});
	});
}
}

//-------------------------------------------------------------------------------------------------------
//goods

//Чтоб выводить карточки на стр их нужно создать. Пишим функцию кот будит эт оделать
//чтоб она могла это сделать функция должна получать обьект
//можно сделать деструктуризацию. Чтоб Не пис ${objCard.label} ${objCard.id} и тд
const createCard = function({ label, name, img, description, id, price } ) {
	const card = document.createElement('div');  //создаем карточку и добавляем ей классы. У нас карта с классами есть сверстаная
	//Чтоб добавить классы можно воспользоваться classList. Но наш div новый и мы можем воспользоваться clаssName. Он перетирает все др классы
	card.className = 'col-lg-3 col-sm-6';  //эти классы я скопировала с html
	//добавляем сюда текущую верстку. InnerHTML тоже перетирает все классы, но внутри у нас пусто и норм
	//cтрока 101 чтоб там где не нужны ценник хит(др) они не выводились. А там где нет ничего - выйдет пустая строка
	
	card.innerHTML = `
	<div class="goods-card">
		${label ? `<span class="label">${label}</span>` : ''} 
		<img src="db/${img}" alt="${name}" class="goods-image">
		<h3 class="goods-title">${name}</h3>
		<p class="goods-description">${description}</p>
		<button class="button goods-card-btn add-to-cart" data-id="${id}">
			<span class="button-price">$${price}</span>
		</button>
	</div>
	`;
	return card;
};
//----------------------------------------------------------------------------------

//пишим функцию кот будит эти карточки показывать на стр/ 1метод
// const renderCards = function(data) {
// 	longGoodsList.textContent = ''; //очищаем карточку
// 	//добавляем body класс чтоб старый не затирать. т.е. показать товары
// 	const cards = data.map(createCard);
// 	cards.forEach(function(card) {
// 		longGoodsList.append(card);
// 	});
// 	document.body.classList.add('show-goods'); //все скрылось тк добавился класс show-goods
// };

// renderCards();

// 2 метод
const renderCards = function(data) {
	longGoodsList.textContent = '';
	const cards = data.map(createCard);
	longGoodsList.append(...cards); //вбудим здесь передавать не просто кард, а по отдельности - разбирет на обьекты. использ метод спред ...
	//если применяем спред к массиву то раб он будит так: он возьмет каждый эл в массиве и распакует через запятую и передаст отдельными эл, не массивом
	//и никакой forEach не нужен
	document.body.classList.add('show-goods'); 
};

const showAll = function(e) {
	e.preventDefault();  //это ссылка и у нее стандартное браузерное поведение - перезагружает стр
	getGoods().then(renderCards);  //выводим все товары
};
// viewAll при добавлении этого класса будит открывать все товары. На небольшим маг можно так делать
viewAll.forEach(function(el) {
	el.addEventListener('click', showAll);
});

//-----------------------------------------------------------------------------------------

//создаем функцию фильтр, кот будит рассортировывать товары при нажатии
// const filterCards = function (field, value) {
// 	getGoods().then(function(data) {
// 		const filteredGoods = data.filter(function (good) {
// 			return good[field] === value;  //если будит совпадение то вернется true
// 			//в методе filter если функция вернула true, то эл кот он в этот момент перебирал он вернется в массив filteredGoods
// 			//если false будит то товар проигнорируется и метод пойдет дальше
// 		});
// 		return filteredGoods;
// 	})
// 	.then(renderCards);
// };
//filterCards('gender', 'Mens'); //выведет только мужчкие товары
//видоизменяем функцию фильтр под стандарты ES6
const filterCards = function (field, value) {
	getGoods()
		.then(data => data.filter(good => good[field] === value)) //good[category] === clothing найдет категорию вещи и запишет ее. а др нет
		.then(renderCards);
};

//------------------------------------------------------------------------------------------

navigationLink.forEach(function(link) {
	link.addEventListener('click', e => {
		e.preventDefault();
		const field = link.dataset.field;  //чтобы получить значение даты атрибута нужно обращаться к обьекту  dataset. Этот
		//обьект будит содержать все дата атрибуты. Строка 35 in html
		const value = link.textContent;
		filterCards(field, value);
	});
});

// будим вызывать функции кот открываю аксесуары и одежду при нажатии на соответствующие кнопки. Заново пис не нужно. Они уже есть
//Просто нужно передать правильно данные

showAcsess.forEach(item => {
	item.addEventListener('click', e => {
		e.preventDefault();
		filterCards('category', 'Accessories');  //пишем так же как в .json
	});
});

showClothing.forEach(item => {
	item.addEventListener('click', e => {
		e.preventDefault();
		filterCards('category', 'Clothing');
	});
});

//-----------------------------------------------------------------------------------------------
//Устанавливаем сервер Open Server. Переносим наш проект в папку domains Open Server. Открываем проект в VSCode. Запускаем Open Server.
//Запустить от имени админа. Мои проекты/gloacademy. Стр сама не перезагружается. Нужно вручную. Если не раб порт то увеличить его на1. 
//Пр.кн. мыши/ настройки/сервер/настройка портов/HTTP. Было 80 = стало 81. Плагины в Хроме лучше отключить. Переходим в js файл. Будим
//работать с сервером. У нас он server.php (файл есть в проекте).

//создаем функцию кот будит раб с сервером
//dataUser - это аргумент , то что будит приниать наша функция
//вызываем fetch и в нее первым параметром передаем адрес сервера. 2м параметром будим передавать настройки

const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('server.php', {
	method: 'POST',  //отправлять будим через метод POST
	body: dataUser,  //отправлять будим это тело
});

//делаем запрос для тестирования
//postData('Hello word');  //чтоб увидить результат нужно зайти в консоль Network/XHR/обновить стр Request(запрос) будит наш Hello word


	//--------------Проверяем данные кот отправлять будим------------------------------------------------
//Если форма пустая, то не отправляем данные 

	const validForm = (formData) => {  //мы передаем параметром formData. Т.к. если не передадим, то он ее не увидит
		//т.к. const formData = new FormData(modalForm); создана ниже. И сейчас ее еще нет
		let valid = false;
	for(const [, value] of formData) { //for(const arr of formData){}
		//мы получаем массив, не элемент. И деструктиризируем его. const [name, value] = arr; Я получаю 1й эл - задаю ему имя: name
		//А 2й будит - value. т.е. мы можем достать данные из формы 
		if(value.trim()) {  //.trim() очищает пробелы, остается пустая строка - false, форма не отправляется.
			valid = true;
		} else {
			valid = false;
			break;
		}
	}
	return valid;
};
	
//---------------------------------------------------------------------------------------------------------


modalForm.addEventListener('submit', e => {
	e.preventDefault();

	const formData = new FormData(modalForm);  //FormData - встроенная, он формирует спец обьект кот сервер понимает. И нужно только указать с
	//какой формы нужны данные. В нашем случае это modalForm
	
	if(validForm(formData)) {
		//когда у нас корзина с товарами и внизу форма с данными, то будит отправлять только имя, тел - данные но не товары. Нужно
		//привязать это к форме.
		formData.append('cart', JSON.stringify(cart.cartGoods));  //'cart' - нужный паарметр в методе append. это как ключ: значение. Имя ключу можно любое
		
		//postData('Hello word'); //Network/XHR/кликаем по кнопке формы и выйдет запрос в консоле. Так будит отправлять/проверять форму
		//postData(formData);  //эту форму закидываем на сервер. и в Network/XHR увидим данные кот ввели в форме. Но этого мало.
		//пишем скрипт кот обрабатывает ответ от сервера и сообщает пользователю его стату.
		//Обрабатывает 2 методами: 1. then - он обрабатывает положительный ответ сервера.
		//2. catch - обрабатывает отрицательный ответ. Есть еще один метод finally - он отработает в любом случае
		//Это свойство можно использовать для очистки формы и ее закрытие.
		postData(formData)
			.then(response => {  //ответ от сервера
				if(!response.ok) {
					throw new Error(response.status);
				}
				alert('Your order is ok. We are call you');
				console.log(response.statusText);
			})
			.catch(error => {              //показывает пользователю что ошибка
				alert('Sorry. Error');
				console.error('err');
			})  
			.finally(() => {   //будит обязательно выполнено
				closeModal();  //форму закрываем
				modalForm.reset();  //форму очищаем
				//cart.cartGoods.length = 0; //лучше обновлять способом ниже
				cart.clearCart();
			});
	} else {
		alert('Write input correct'); //Если форма пустая, то не отправляем данные , а выдаем сообщение
	}

});


