/**
 * 변경 히스토리 : 131028_추가, 131030_수정
 */
;(function($, WEBSVC, PBPGN, undefined) {
	var $doc = $(document),
		Class = WEBSVC.Class;

	//20140325추가
	//컨펌 레이어드 팝업
    WEBSVC.define('WEBSVC.alert3', function () {
        var Modal = MELON.PBPGN.Modal;

        var tmpl = ['<div class="layer_popup no_title d_like_alert" style="display:none">',//140123_수정
	                	'<div class="layer_cntt">',
	                		'<div class="d_content box_default">',//140114_수정
	                	'</div>',
	                	'<div class="wrap_btn_c">',
		                	'<button type="button" class="btn_emphs_small confrm" data-role="ok"><span class="odd_span"><span class="even_span">확인</span></span></button> ',
	                        '<button type="button" class="btn_emphs02_small d_close"><span class="odd_span"><span class="even_span">취소</span></span></button>',
	                    '</div>',
	                '</div>',
	                '<button type="button" class="btn_close d_close"><span class="odd_span">닫기</span></button>',
	                '<span class="shadow"></span>',
	            '</div>'].join('');
        /**
         * 얼럿레이어
         * @memberOf MELON.WEBSVC
         * @name alert
         * @function
         * @param {String} msg 얼럿 메세지
         * @param {JSON} options 모달 옵션
         * @example
         * MELON.WEBSVC.alert('안녕하세요');
         */

        return function (msg, options) {

            if(typeof msg !== 'string' && arguments.length === 0) {
                options = msg;
                msg = '';
            };
            var el = $(tmpl).appendTo('body').find('div.d_content').html(msg).end();
            var modal = new Modal(el, options);

            return el.on('modalhidden', function(){
                el.remove();
            });
        };
    });


	/**
	 * 로그인 팝업
	 * @function
	 * @name MELON.WEBSVC.loginPopup
	 * @param {String} options.redirect (Optional) 리다이렉트 url
	 * @param {String} options.userid (Optional) 아이디
	 */
	WEBSVC.define('WEBSVC.loginPopup', function () {
		var uri = WEBSVC.uri;

		return function(opts) {
			WEBSVC.openPopup(uri.addToQueryString('/member/MM4.1P_01.html', opts), 560, 420);
		};
	});

	// 131030_수정
	WEBSVC.define('WEBSVC.SongList', function() {
		var _isInited = false;

		/**
		 * 곡리스트
		 * @namespace
		 * @name MELON.WEBSVC.SongList
		 */
		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button02: {
					normal: '<span class="odd_span">{TXT}</span>'
				},
				button: {
					normal: "<span class=\"odd_span\">{TXT}</span>\n<span class=\"cnt\">\n<span class=\"none\">총건수</span>\n{CNT}</span>"
				}
			},
			init: function(){
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				// 곡리스트에 있는 체크박스가 checked 됐을 때, tr에 on클래스 추가
				$doc.on('changed.songlist click.songlist', 'div.d_song_list tbody input:checkbox', function(e){
					var $this = $(this);
					$this.closest('tr')[ $this.prop('checked') ? 'addClass' : 'removeClass' ]('on');
				});

				// 전체선택 버튼
				$doc.on('click.songlist', 'div.d_song_list button.d_checkall', function(e){
					$(this).closest('div.d_song_list').find('thead input:checkbox').trigger('click');
				});

				// 좋아요 버튼
				$doc.on('click.songlist', '.d_song_list button.like, .d_song_list button.btn_like_b, .d_song_list button.btn_icon_emphs ', function(e){
					e.preventDefault();
					e.stopPropagation();

					var $btn = $(this),
						tmpl = me.template[ ($btn.attr('data-tmpl-name') || 'normal') ],
						songNo = $btn.attr('data-song-no'),
						menuId = $btn.attr('data-song-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [songNo, doLike]);
					if(event.isDefaultPrevented()){ return; }

					$btn.trigger('mouseleave'); //140401_수정

					if(isLike) {
//						WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true});
//						defer = me.dislike(songNo,menuId)
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
//								setTimeout(function() {
//									WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
//								},1);
								likeM(me.dislike(songNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
//							WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							likeM(me.dislike(songNo,menuId));
						}
					} else {
						likeM(me.like(songNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [songNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));

								if($btn.is('button.btn_icon_emphs')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
									);
									$btn.next().html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								} else if($btn.is('button.btn_song_like, button.btn_like_b')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								} else {
									tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
									).prop('disabled', true).prop('disabled', false);
								}
								// 140114_수정
								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}
							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					async : false
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject('알수 없는 이유로 작업을 중단하였습니다.');
				});
			},

			like: function(songNo,menuId) {
				var defer = $.Deferred();

				if(!songNo){ defer.reject(['곡 번호가 없습니다.(좋아요 버튼에 data-song-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-song-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + songNo + '&type=song&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(songNo,menuId) {
				var defer = $.Deferred();

				if(!songNo){ defer.reject(['곡 번호가 없습니다.(좋아요 버튼에 data-song-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-song-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + songNo + '&type=song&menuId=' + menuId, defer);

				return defer;
			}
		};
	});

	WEBSVC.define('WEBSVC.AlbumList', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button02: {
					normal: '<span class="odd_span">{TXT}</span>'
				},
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},
			init: function() {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				// 전체선택 버튼
				$doc.on('click.albumlist', 'div.d_album_list button.d_checkall', function(e){
					$(this).closest('div.d_album_list').find('thead input:checkbox').trigger('click');
				});

				// 좋아요 버튼
				$doc.on('click.albumlist', '.d_album_list button.like, .d_album_list a.btn_like, .d_album_list button.btn_like_b, .d_album_list button.btn_song_like', function(e){
					e.preventDefault();
					e.stopPropagation();

					// 131114_수정
					var $btn = $(this),
						albumNo = $btn.attr('data-album-no'),
						menuId = $btn.attr('data-album-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [albumNo, doLike]);
					if(event.isDefaultPrevented()){ return; }

					 $btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
//						WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true});
//						defer = me.dislike(albumNo,menuId)
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
//								setTimeout(function() {
//									WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
//								},1);
								likeM(me.dislike(albumNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
//							WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							likeM(me.dislike(albumNo,menuId));
						}
					} else {
						likeM(me.like(albumNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var tmpl = '',
							summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [albumNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));

								if($btn.is('button.btn_song_like, button.btn_like_b')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								}else if($btn.is('button.btn_like_m ,button.btn_like_m03')){
									$btn.parent().find('.cnt_span').text(summCnt);
								} else {
									if($btn.is('button')){
										tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];

									} else {
										tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
									}

									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
									);
								}
								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}

							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					async : false
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(albumNo,menuId) {
				var defer = $.Deferred();

				if(!albumNo){ defer.reject(['앨범 번호가 없습니다.(좋아요 버튼에 data-album-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-album-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + albumNo + '&type=album&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(albumNo,menuId) {
				var defer = $.Deferred();

				if(!albumNo){ defer.reject(['앨범 번호가 없습니다.(좋아요 버튼에 data-album-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-album-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + albumNo + '&type=album&menuId=' + menuId, defer);

				return defer;
			}
		};
	});

	WEBSVC.define('WEBSVC.VideoList', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button02: {
					normal: '<span class="odd_span"><span class="even_span"><span class="icon"></span><span class="none">{TXT}</span><span class="none">총건수</span> {CNT}</span></span>'
				},
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},

			init: function() {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				// 전체선택 버튼
				$doc.on('click.videolist', 'div.d_video_list button.d_checkall', function(e){
					$(this).closest('div.d_video_list').find('thead input:checkbox').trigger('click');
				});

				// 좋아요 버튼
				$doc.on('click.videolist', '.d_video_list button.like, .d_video_list a.btn_like, .d_video_list button.btn_base02.like, .d_video_list button.btn_like_m', function(e){
					e.preventDefault();
					e.stopPropagation();

					var $btn = $(this),
						videoNo = $btn.attr('data-video-no'),
						menuId = $btn.attr('data-video-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [videoNo, doLike]);
					if(event.isDefaultPrevented()){ return; }
					$btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
//						WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true});
//						defer = me.dislike(videoNo,menuId)
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
//								setTimeout(function() {
//									WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
//								},1);
								likeM(me.dislike(videoNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
//							WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							likeM(me.dislike(videoNo,menuId));
						}
					} else {
						likeM(me.like(videoNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var tmpl = '',
							summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [videoNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));

								if($btn.is('button.btn_base02.like, button.btn_like_m')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								} else {
									if($btn.is('button')){
										tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];
									} else {
										tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
									}

									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
									);
								}

								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true});

							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}

							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					async : false
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(videoNo,menuId){
				var defer = $.Deferred();

				if(!videoNo){ defer.reject(['영상 번호가 없습니다.(좋아요 버튼에 data-video-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-video-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + videoNo + '&type=video&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(videoNo,menuId) {
				var defer = $.Deferred();

				if(!videoNo){ defer.reject(['영상 번호가 없습니다.(좋아요 버튼에 data-video-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-video-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + videoNo + '&type=video&menuId=' + menuId, defer);

				return defer;
			}
		};
	});
	// 131030_수정

	WEBSVC.define('WEBSVC.UserList', function() {
		var _isInited = false;
		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button: {
					normal: '<span class="odd_span"><span class="even_span">\n<span class="icon"></span>\n	{TXT}\n</span></span>'
				}
			},

			// 취소가능 여부
			canCancel: false,

			init: function(options){
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				$.extend(me, options);

				$doc.on('click.userlist', '.d_user_list button.confmlk_frend', 'button.btn_small02.confmlk_frend', function(e) {
					e.preventDefault();
					e.stopPropagation();

					var $btn = $(this),
						isJoin = $btn.hasClass('on'), doJoin = !isJoin,
						userNo = $btn.attr('data-user-no'),
						menuId = $btn.attr('data-menu-id'),
						userName = $btn.attr('data-user-name') || '',
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('joinbefore')), [userNo, doJoin]);
					if(event.isDefaultPrevented()){ return; }

					// 로그인 체크
					if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
						//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
						MELON.WEBSVC.POC.login.loginPopupLayerd('');
						return;
					}

					if(isJoin && me.canCancel) {
						if(!confirm('친구를 취소하시겠습니까?\n친구를 취소하면 친구리스트에서 삭제되어 친구와 음악, 소식을 나눌 수 없습니다.')){ return; }
						defer = me.leave(userNo, menuId);
					} else {
						if(userNo == getMemberKey()){
							alert("나와는 친구를 맺을 수 없습니다.");
							return;
						}
						if(!confirm((userName ? userName + "님과 " : "") + "친구를 맺으시겠습니까?\n친구리스트는 마이뮤직>친구에서 확인 할 수 있습니다.")){ return; }
						defer = me.join(userNo, menuId);
					}
					defer.done(function(json) {
						var tmpl = me.template.button[$btn.attr('data-tmpl-name') || 'normal'],
						caption = '',
						summCnt = 0;

						if(json.result === true) {
							if(json.summCnt > 999999){
								summCnt = '999,999+';
							} else {
								summCnt = json.summCnt.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
							}

							$btn.trigger((event = $.Event('joinchanged')), [userNo, userName, doJoin, json.errorMessage]);
							if(event.isDefaultPrevented()){ return; }

							if(me.canCancel) {
								caption = (doJoin ? '친구맺기 취소' : '친구맺기');
							} else {
								caption = "친구입니다.";
								//var $span = $('<span type="button" class="btn_small02 confmlk_frend on disabled" tabIndex="0" title="'+json.data.title+' 친구입니다"><span><span><span class="icon"></span> 친구</span></span></span>');
								//$btn.replaceWith($span);
								//$span.focus();
								$btn.prop('disabled', true).addClass('disabled').attr('tabIndex',0);
								$target.html(summCnt);
							}

							$btn[doJoin ? 'addClass' : 'removeClass']('on')
								.attr('title', userName + caption)
								.html( tmpl.replace(/\{TXT\}/g, (doJoin ? '친구' : '친구맺기')) );

							// 클릭 로그 - 로그클래스 수정.
							$btn.removeClass("mlog_without_page_change");

						} else {
/*							if(json.errorMessage == "NOTEXIST"){
								alert("존재하지 않는 회원입니다.");
							}else if(json.errorMessage == "WITHDRAWAL"){
								alert("탈퇴한 회원입니다.");
							}else if(json.errorMessage == "MINE"){
								alert("나와는 친구를 맺을 수 없습니다.");
							}else{
								if(doJoin){
									alert("친구 맺기에 실패 하였습니다.");
								}else{
									alert("친구 취소에 실패 하였습니다.");
								}
							}*/
							alert(json.errorMessage);
						}
					}).fail(function(msg){
						alert(msg || '예상치 못한 이유로 작업이 중단되었습니다.');
					});
				});

			},

			_ajax: function(url, defer){
//				// 로그인 체크
//				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
//					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
//					MELON.WEBSVC.POC.login.loginPopupLayerd('');
//					return;
//				}

				$.ajax({
					url: url,
					type : 'POST',
					dataType: 'json'
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			join: function(userNo, menuId) {
				var defer = $.Deferred();

				if(!userNo){ defer.reject(['유저 번호가 없습니다.(친구맺기 버튼에 data-user-no=""를 넣어주세요.)']); return defer; }
				this._ajax( '/mymusic/friend/mymusicfriend_insertFriend.json?fMemberKey=' + userNo + '&menuId=' + menuId, defer);
				return defer;
			},

			leave: function(userNo, menuId) {
				var defer = $.Deferred();

				if(!userNo){ defer.reject(['유저 번호가 없습니다.(친구맺기 버튼에 data-user-no=""를 넣어주세요.)']); return defer; }
				this._ajax( '/mymusic/friend/mymusicfriend_deleteFriend.json?fMemberKey=' + userNo + '&menuId=' + menuId, defer);

				return defer;
			}
		};
	});

	/* ********************************************************************************
	* 팬맺기 관련
	* @since	2013.11.18 $target.html에 <span></span> 추가
	* @since	2013.11.22 $target.html에 명 삭제
	* @since	2013.12.26 로그인 체크 순서 변경 및 팬 맺기 후 alert("팬이 되었습니다") 추가
	* @since	2013.12.26 checkCancen 추가
	* @since	2014.01.27 같은 아티스트가 있을 경우 같이 변경
	* @since	2014.02.26 span에 class="odd_span" / class="cnt_span" 추가
	* @since	2014.05.12 마우스 이벤트 수정
	******************************************************************************** */
	WEBSVC.define('WEBSVC.ArtistList', function() {
		var _isInited = false,
			addComma = WEBSVC.number.addComma;

		return {
			template: {
				button: {
					normal: '<span class="odd_span">{TXT}</span>'
				}
			},

			// 취소가능 여부
			canCancel: false,

			init: function(options){
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				$.extend(me, options);

				$doc.on('click.artistlist', '.d_artist_list *[data-artist-no]', function(e) {
					e.preventDefault();
					e.stopPropagation();

					// 로그인 체크
					if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
						//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
						MELON.WEBSVC.POC.login.loginPopupLayerd('');
						return;
					}

					var $btn = $(this),
						isJoin = $btn.hasClass('on'), doJoin = !isJoin,
						artistNo = $btn.attr('data-artist-no'),
						menuId = $btn.attr('data-artist-menuId'),
						title = $btn.attr('title').split(' 팬맺기'),
						$target = (function(){
							var $cnt = $btn.next('span.cnt_fan');
							if($cnt.length){
								return $cnt;
							}
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $(); }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					// 팬맺기 취소할값들만 TRUE값을 줌
					var checkCancen = $btn.attr('data-artist-cancel');
					if(checkCancen){
						me.canCancel = true;
					}

					$btn.trigger((event = $.Event('joinbefore')), [artistNo, doJoin]);
					if(event.isDefaultPrevented()){ return; }

					$btn.trigger('mouseleave'); //140512_수정

					if(isJoin && me.canCancel) {
						//confirm창 레이어드로 변경
						WEBSVC.confirm2('팬 맺은 아티스트를 취소하시겠습니까?').on('ok', function(){
							likeM(me.leave(artistNo,menuId));
						})
						.on('cancel', function(){
							return false;
						});
					} else {
						//if(!confirm("팬을 맺으시겠습니까?")){ return; }
                        //140319_공통기능 수정
                        if(!isMelonLogin()) {//로그인전이라면
                            MELON.WEBSVC.loginLayer({userid: 'melon'});
                            return defer;
                        }else{
                        	likeM(me.join(artistNo,menuId));
                        }
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var tmpl = me.template.button[$btn.attr('data-tmpl-name') || 'normal'],
								caption = '';
							if(json.result === true) {
								$btn.trigger((event = $.Event('joinchanged')), [artistNo, title[0], doJoin, json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,")]);
								if(event.isDefaultPrevented()){ return; }

								if(me.canCancel) {
									caption = (doJoin ? '팬맺기 취소' : '팬맺기');
									me.joinAll(artistNo, json.data.SUMMCNT, true);
								} else {
									caption = "팬입니다.";
									$btn.prop('disabled', true).addClass('disabled').attr('tabIndex',0);
									me.joinAll(artistNo, json.data.SUMMCNT, false);

									// 클릭 로그 - 로그클래스 수정.
									$btn.removeClass("mlog_without_page_change");
								}

								$btn[doJoin ? 'addClass' : 'removeClass']('on').attr('title', title[0] + ' ' + caption).html(tmpl.replace(/\{TXT\}/g, caption));
								//2013.11.18,2014.01-27
								//$target.html('<span>'+json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,")+'</span>');
								$("button[data-artist-no='"+artistNo+"']").next('span.cnt_fan').find("span.cnt_span").text(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));

								doJoin && WEBSVC.alert2('팬이 되었습니다.</br><a href="javascript:melon.menu.goMyMusicMain();" class="fc_strong">마이뮤직</a>에서 확인하세요.',{opener :$btn, removeOnClose:true, overlayNotClose:true});//140603_수정
							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}

							}
						}).fail(function(msg){
							alert(msg || '예상치 못한 이유로 작업이 중단되었습니다.');
						});
					}
				});
			},

			_ajax: function(url, defer) {

				$.ajax({
					url: url,
					type : 'POST',
					async : false
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			join: function(artistNo,menuId) {
				var defer = $.Deferred();

				if(!artistNo){ defer.reject(['아티스트 번호가 없습니다.(좋아요 버튼에 data-artist-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-artist-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + artistNo + '&type=artist&menuId=' + menuId, defer);
//				alert("팬이 되었습니다.");

				return defer;
			},

			leave: function(artistNo,menuId) {
				var defer = $.Deferred();
				if(!artistNo){ defer.reject(['아티스트 번호가 없습니다.(좋아요 버튼에 data-artist-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-artist-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + artistNo + '&type=artist&menuId=' + menuId, defer);

				return defer;
			},

			joinAll: function(artistNo, totCount,checkFlg) {
				var defer = $.Deferred();
				var tmpl = '<span class="odd_span">{TXT}</span>';
				var tempTitle = $("button[data-artist-no='"+artistNo+"']").attr('title');
				if(checkFlg) {
					$("button[data-artist-no='"+artistNo+"']:not(:disabled)").prop('disabled', true).addClass('on disabled').attr('title', tempTitle.replace('팬맺기', '팬입니다.')).html(tmpl.replace(/\{TXT\}/g, '팬'));
				} else {
					$("button[data-artist-no='"+artistNo+"']:not(:disabled)").prop('disabled', true).addClass('on disabled').attr('tabIndex',0).attr('title', tempTitle.replace('팬맺기', '팬입니다.')).html(tmpl.replace(/\{TXT\}/g, '팬'));
				}
			}
		};
	});

	WEBSVC.define('WEBSVC.PhotoList', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button2016: {
					normal: '<span class="cnt_like_h36"><span id="d_like_count_p1" class="cnt_span">{CNT}</span></span>'
				},
				button02: {
					normal: '<span class="odd_span"><span class="even_span"><span class="icon"></span>{TXT}</span></span>'
				},
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},

			init: function() {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				/* 전체선택 버튼 마크업 변경으로 사용안함
				$doc.on('click.photolist', 'div.d_photo_list button.d_checkall', function(e){
					$(this).closest('div.d_photo_list').find('thead input:checkbox').trigger('click');
				});
                */
                //140319_수정
                $doc.on('click.d_checkall', 'div.photo_wrap>div.wrap_btn>button.d_checkall', function (e) {
                    var $this = $(e.currentTarget),
                        $items = $("div.photo_list").find('input[type=checkbox]:visible:enabled');

                    if ( $this.data("data-checked") === true ) {
                        $this.data("data-checked", false);
                        $items.prop("checked",false);
                    } else {
                        $this.data("data-checked", true);
                        $items.prop("checked",true);
                    }
                });

				// 좋아요 버튼
				$doc.on('click.photolist', '.d_photo_list *[data-photo-no]', function(e){
					e.preventDefault();

					var $btn = $(this),
						photoNo = $btn.attr('data-photo-no'),
						menuId = $btn.attr('data-photo-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [photoNo, doLike]);
					if(event.isDefaultPrevented()){ return; }
					$btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
//						WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
//						defer = me.dislike(photoNo,menuId)
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
//								setTimeout(function() {
//									WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
//								},1);
								likeM(me.dislike(photoNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
//							WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							likeM(me.dislike(photoNo,menuId));
						}
					} else {
						likeM(me.like(photoNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var tmpl = '',
							summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [photoNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));
								if($btn.is('button.btn_like_h28')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(replace(/\{CNT\}/g, json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,")))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								} else if($btn.is('button.btn_like_h36')){
									tmpl = me.template.button2016[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{CNT\}/g, json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								}else{
									if($btn.is('button')){
										tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];
									} else {
										tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
									}

									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"))
									);
								}
								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true});

							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}

							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					async : false
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(photoNo,menuId){
				var defer = $.Deferred();

				if(!photoNo){ defer.reject(['포토 번호가 없습니다.(좋아요 버튼에 data-photo-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-photo-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + photoNo + '&type=photo&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(photoNo,menuId) {
				var defer = $.Deferred();

				if(!photoNo){ defer.reject(['포토 번호가 없습니다.(좋아요 버튼에 data-photo-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-photo-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + photoNo + '&type=photo&menuId=' + menuId, defer);

				return defer;
			}
		};
	});

	WEBSVC.define('WEBSVC.DownList', function() {
		var _isInited = false;

		/**
		 * 다운로드 리스트
		 * @namespace
		 * @name MELON.WEBSVC.DownList
		 */
		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				normal: "<span>{TXT}</span>\n<span class=\"cnt\">\n<span class=\"none\">총건수</span>\n{CNT}</span>"
			},
			init: function(){
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				// 곡리스트에 있는 체크박스가 checked 됐을 때, tr에 on클래스 추가
				$doc.on('changed.downlist click.downlist', 'div.d_down_list tbody input:checkbox', function(e){
					var $this = $(this);
					$this.closest('tr')[ $this.prop('checked') ? 'addClass' : 'removeClass' ]('on');
				});

				//140424_전체선택 버튼 기능제거
                /*
                    $doc.on('click', 'div.d_down_list input:checkbox.d_downall', function(e){
                        var $this = $(this);
                        $this.closest('table').find('>tbody').find('input:checkbox:enabled:visible').checked(this.checked); //.prop('checked', this.checked);

                        // 전체 선택시 다운로드 요청곡수 세팅
                        $('ul.list_bullet span:first').html($this.closest('table').find('tbody input:checkbox:checked').length + '곡');
                    });
                */
			}
		};
	});

	// 131028_추가, 131030_수정
	WEBSVC.define('WEBSVC.PlayList', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button02: {
					normal: '<span class="odd_span"><span class="even_span"><span class="icon"></span>{TXT}</span></span>'
				},
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},

			init: function(opts) {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;
				opts = opts || {};

				// 전체선택 버튼
				$doc.on('click.playlist', 'div.d_play_list button.d_checkall', function(e){
					$(this).closest('div.d_play_list').find('thead input:checkbox').trigger('click');
				});

				// 좋아요 버튼
				$doc.on('click.playlist', '.d_play_list button.btn_base02.like, .d_play_list button.like, .d_play_list a.btn_like, .d_play_list button.btn_like_b, .d_play_list button.btn_like_m', function(e){
					e.preventDefault();
					e.stopPropagation();

					var $btn = $(this),
						tmpl = opts.tmpl || me.template[ ($btn.attr('data-tmpl-name') || 'normal') ],
						playNo = $btn.attr('data-play-no'),
						menuId = $btn.attr('data-play-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [playNo, doLike]);
					if(event.isDefaultPrevented()){ return; }
					$btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
//						WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true});
//						defer = me.dislike(playNo,menuId)
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
//								setTimeout(function() {
//									WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
//								},1);
								likeM(me.dislike(playNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
//							WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							likeM(me.dislike(playNo,menuId));
						}
					} else {
						likeM(me.like(playNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [playNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));

								if($btn.is('button.btn_like_m')){
	//								$btn.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')); 화면에서 처리하고 있음
								}
								else if($btn.is('button.btn_base02.like, button.btn_like_b')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								} else {
									if($btn.is('button')){
										tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];

									} else {
										tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
									}
									// 131113_수정
									tmpl && $btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
									);
									// 131113_수정
								}
								if($btn.is('button.btn_like_m')){
	//								$btn.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')); 화면에서 처리하고 있음
								}else{
									doLike && WEBSVC.confirm2('좋아요 반영 되었습니다.<br />마이뮤직 &gt 좋아요에서 확인하세요.<br />내 플레이리스트에도 저장 하시겠습니까?').on('ok', function(){
										$.ajax({
											type : "POST",
											url  : "/mymusic/common/mymusiccommon_copyPlaylist.json",
											data : {plylstSeq : playNo},
											async : false,
											success : function(data){
												if(data.result >= 0){
													$btn.trigger((event = $.Event('makeplaylist')), [playNo]);
													setTimeout(function() {
														WEBSVC.alert2('플레이리스트에 저장 되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
													},1);
												}
												else if(data.result == -201){
													setTimeout(function() {
														WEBSVC.alert2('플레이리스트 정보가 존재하지 않습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
													},1);
												}
												else if(data.result == -606){
													setTimeout(function() {
														WEBSVC.alert2('플레이리스트는 최대 500개까지 만드실 수 있습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
													},1);
												}
												else{
													setTimeout(function() {
														WEBSVC.alert2('플레이리스트 복사하는데 실패하였습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
													},1);
												}
											}
										});
									});
								}
							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}

							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					dataType: 'json'
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(playNo,menuId){
				var defer = $.Deferred();

				if(!playNo){ defer.reject(['플레이 리스트 번호가 없습니다.(좋아요 버튼에 data-play-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-play-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + playNo + '&type=playlist&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(playNo,menuId) {
				var defer = $.Deferred();

				if(!playNo){ defer.reject(['플레이 리스트 번호가 없습니다.(좋아요 버튼에 data-play-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-play-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + playNo + '&type=playlist&menuId=' + menuId, defer);

				return defer;
			}
		};
	});
	// 131028_추가, 131030_수정

	// 131218_추가
	WEBSVC.define('WEBSVC.PartnerPlayList', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button02: {
					normal: '<span class="odd_span"><span class="even_span"><span class="icon"></span>{TXT}</span></span>'
				},
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},

			init: function(opts) {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;
				opts = opts || {};

				// 전체선택 버튼
				$doc.on('click.playlist', 'div.d_partnerplay_list button.d_checkall', function(e){
					$(this).closest('div.d_partnerplay_list').find('thead input:checkbox').trigger('click');
				});

				// 좋아요 버튼
				$doc.on('click.playlist', '.d_partnerplay_list button.btn_base02.like, .d_partnerplay_list button.like, .d_partnerplay_list a.btn_like, .d_partnerplay_list button.btn_like_b', function(e){
					e.preventDefault();
					e.stopPropagation();
					var $btn = $(this),
						tmpl = opts.tmpl || me.template[ ($btn.attr('data-tmpl-name') || 'normal') ],
						playNo = $btn.attr('data-play-no'),
						menuId = $btn.attr('data-play-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [playNo, doLike]);
					if(event.isDefaultPrevented()){ return; }
					$btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
//						WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true});
//						defer = me.dislike(playNo,menuId)
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
//								setTimeout(function() {
//									WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
//								},1);
								likeM(me.dislike(playNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
//							WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							likeM(me.dislike(playNo,menuId));
						}
					} else {
						likeM(me.like(playNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [playNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));

								if($btn.is('button.btn_base02.like, button.btn_like_b')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								} else {
									if($btn.is('button')){
										tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];

									} else {
										tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
									}
									// 131113_수정
									tmpl && $btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
									);
									// 131113_수정
								}
								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true});
							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}

							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					dataType: 'json'
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(playNo,menuId){
				var defer = $.Deferred();

				if(!playNo){ defer.reject(['플레이 리스트 번호가 없습니다.(좋아요 버튼에 data-play-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-play-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + playNo + '&type=partnerplaylist&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(playNo,menuId) {
				var defer = $.Deferred();

				if(!playNo){ defer.reject(['플레이 리스트 번호가 없습니다.(좋아요 버튼에 data-play-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-play-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + playNo + '&type=partnerplaylist&menuId=' + menuId, defer);

				return defer;
			}
		};
	});

	// 170104 추가
	// 나우플레잉 좋아요
	WEBSVC.define('WEBSVC.Nowplaying', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button02: {
					normal: '<span class="odd_span"><span class="even_span"><span class="icon"></span>{TXT}</span></span>'
				},
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},

			init: function(opts) {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;
				opts = opts || {};

				// 전체선택 버튼
				$doc.on('click.nowplaying', 'div.d_nowplaying_list button.d_checkall', function(e){
					$(this).closest('div.d_nowplaying_list').find('thead input:checkbox').trigger('click');
				});

				// 좋아요 버튼
				$doc.on('click.nowplaying', '.d_nowplaying_list button.btn_base02.like, .d_nowplaying_list button.like, .d_nowplaying_list a.btn_like, .d_nowplaying_list button.btn_like_b', function(e){
					e.preventDefault();
					e.stopPropagation();
					var $btn = $(this),
						tmpl = opts.tmpl || me.template[ ($btn.attr('data-tmpl-name') || 'normal') ],
						nowplayingNo = $btn.attr('data-nowplaying-no'),
						menuId = $btn.attr('data-nowplaying-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [nowplayingNo, doLike]);
					if(event.isDefaultPrevented()){ return; }
					$btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
								likeM(me.dislike(nowplayingNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
							likeM(me.dislike(nowplayingNo,menuId));
						}
					} else {
						likeM(me.like(nowplayingNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [nowplayingNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));

								if($btn.is('button.btn_base02.like, button.btn_like_b')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								} else {
									if($btn.is('button')){
										tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];

									} else {
										tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
									}
									// 131113_수정
									tmpl && $btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
									);
									// 131113_수정
								}
								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true});
							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}

							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					dataType: 'json'
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(nowplayingNo,menuId){
				var defer = $.Deferred();

				if(!nowplayingNo){ defer.reject(['나우플레잉 번호가 없습니다.(좋아요 버튼에 data-nowplaying-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-nowplaying-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + nowplayingNo + '&type=nowplaying&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(nowplayingNo,menuId) {
				var defer = $.Deferred();

				if(!nowplayingNo){ defer.reject(['나우플레잉 번호가 없습니다.(좋아요 버튼에 data-nowplaying-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-nowplaying-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + nowplayingNo + '&type=nowplaying&menuId=' + menuId, defer);

				return defer;
			}
		};
	});

	// 스토리 좋아요
	WEBSVC.define('WEBSVC.Story', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button02: {
					normal: '<span class="odd_span"><span class="even_span"><span class="icon"></span>{TXT}</span></span>'
				},
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},

			init: function(opts) {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;
				opts = opts || {};

				// 전체선택 버튼
				$doc.on('click.story', 'div.d_story_list button.d_checkall', function(e){
					$(this).closest('div.d_story_list').find('thead input:checkbox').trigger('click');
				});

				// 좋아요 버튼
				$doc.on('click.story', '.d_story_list button.btn_base02.like, .d_story_list button.like, .d_story_list a.btn_like, .d_story_list button.btn_like_b', function(e){
					e.preventDefault();
					e.stopPropagation();
					var $btn = $(this),
						tmpl = opts.tmpl || me.template[ ($btn.attr('data-tmpl-name') || 'normal') ],
						storyNo = $btn.attr('data-story-no'),
						menuId = $btn.attr('data-story-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [storyNo, doLike]);
					if(event.isDefaultPrevented()){ return; }
					$btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
								likeM(me.dislike(storyNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
							likeM(me.dislike(storyNo,menuId));
						}
					} else {
						likeM(me.like(storyNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [storyNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));

								if($btn.is('button.btn_base02.like, button.btn_like_b')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								} else {
									if($btn.is('button')){
										tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];

									} else {
										tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
									}
									// 131113_수정
									tmpl && $btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
									);
									// 131113_수정
								}
								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true});
							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}

							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					dataType: 'json'
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(storyNo,menuId){
				var defer = $.Deferred();

				if(!storyNo){ defer.reject(['스토리 번호가 없습니다.(좋아요 버튼에 data-story-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-story-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + storyNo + '&type=story&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(storyNo,menuId) {
				var defer = $.Deferred();

				if(!storyNo){ defer.reject(['나우플레잉 번호가 없습니다.(좋아요 버튼에 data-story-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-story-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + storyNo + '&type=story&menuId=' + menuId, defer);

				return defer;
			}
		};
	});

	// 테마 좋아요
	WEBSVC.define('WEBSVC.Theme', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button02: {
					normal: '<span class="odd_span"><span class="even_span"><span class="icon"></span>{TXT}</span></span>'
				},
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},

			init: function(opts) {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;
				opts = opts || {};

				// 전체선택 버튼
				$doc.on('click.theme', 'div.d_theme_list button.d_checkall', function(e){
					$(this).closest('div.d_nowplaying_list').find('thead input:checkbox').trigger('click');
				});

				// 좋아요 버튼
				$doc.on('click.theme', '.d_theme_list button.btn_base02.like, .d_theme_list button.like, .d_theme_list a.btn_like, .d_theme_list button.btn_like_b', function(e){
					e.preventDefault();
					e.stopPropagation();
					var $btn = $(this),
						tmpl = opts.tmpl || me.template[ ($btn.attr('data-tmpl-name') || 'normal') ],
						themeNo = $btn.attr('data-theme-no'),
						menuId = $btn.attr('data-theme-menuId'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [themeNo, doLike]);
					if(event.isDefaultPrevented()){ return; }
					$btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
						if ($btn.hasClass('mymusic_like2')) {
							WEBSVC.confirm2('좋아요를 취소 하시겠습니까?').on('ok', function(){
								likeM(me.dislike(themeNo,menuId));
							})
							.on('cancel', function(){
								return false;
							});
						}else {
							likeM(me.dislike(themeNo,menuId));
						}
					} else {
						likeM(me.like(themeNo,menuId));
					}

					function likeM(defer) {
						var defer = defer;
						defer.done(function(json) {
							var summCnt = 0;
							if(json.result === true) {
								if(json.data.SUMMCNT > 999999){
									summCnt = '999,999+';
								} else {
									summCnt = json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,");
								}

								isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});

								$btn.trigger((event = $.Event('likechanged')), [themeNo, title[0], doLike, summCnt]);
								if(event.isDefaultPrevented()){ return; }

								$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));

								if($btn.is('button.btn_base02.like, button.btn_like_b')){
									tmpl = me.template.button02[ $btn.attr('data-tmpl-name') || 'normal' ];
									$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
									);
									$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
								} else {
									if($btn.is('button')){
										tmpl = me.template.button[ $btn.attr('data-tmpl-name') || 'normal' ];

									} else {
										tmpl = me.template.a[ $btn.attr('data-tmpl-name') || 'normal' ];
									}
									// 131113_수정
									tmpl && $btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, summCnt)
									);
									// 131113_수정
								}
								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true});
							} else {
								alert(json.errorMessage);
								//토큰 유효성체크
								if(json.tockenValid != undefined && json.tockenValid == false){
									var pocId = MELON.WEBSVC.POC.getPocId();
									if('WP42' == pocId){
										try {
											MelonAPI.window("forceLogout", "");
										} catch(e) {
										}
									}else{
										location.href = json.returnUrl;
									}
								}

							}
						}).fail(function(msg){
							alert(msg);
						});
					}
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					dataType: 'json'
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(themeNo,menuId){
				var defer = $.Deferred();

				if(!themeNo){ defer.reject(['나우플레잉 번호가 없습니다.(좋아요 버튼에 data-theme-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-theme-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + themeNo + '&type=theme&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(themeNo,menuId) {
				var defer = $.Deferred();

				if(!themeNo){ defer.reject(['나우플레잉 번호가 없습니다.(좋아요 버튼에 data-theme-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 ID가 없습니다.(좋아요 버튼에 data-theme-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + themeNo + '&type=theme&menuId=' + menuId, defer);

				return defer;
			}
		};
	});
	// 170104 추가

	// 131106_추가
	/* ********************************************************************************
	* 커밍순 알림 예약
	* @author	한병기
	* @param	data-rsrv-type	: 예약여부(Y:예약완료 / N:알림예약)
	* 			data-csoon-no	: 커밍순SEQ
	* @since	2013.11.07	(data-artist-no : 삭제 / data-alarm-type → data-rsrv-type : 변경 / data-type-no → data-csoon-no : 변경)
	* @since	2013.11.21	로그인체크 팝업 변경
	* @since	2013.12.17	로그인체크관련 순서 변경
	* @since	2013.12.18	data-rsrv-summcnt 추가 예약자수 / 예약자수 관련 변경
	* @since	2014.02.26	span에 class="odd_span" 추가
	* @since	2014.04.21	예약수 관련 변경(최신음악 커밍순)
	******************************************************************************** */
	WEBSVC.define('WEBSVC.AlarmList', function() {
		var _isInited = false,
			addComma = WEBSVC.number.addComma;

		return {
			init: function(options){
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				$.extend(me, options);

				$doc.on('click.alarmlist', 'button.btn_rsrv', function(e) {
					e.preventDefault();
					e.stopPropagation();

					// 로그인 체크
					if(!WEBSVC.Auth.isMelonLogin()) {
						//defer.reject('로그인 후에 이용해 주세요.');
						MELON.WEBSVC.POC.login.loginPopupLayerd('');	//2013.11.21
						return;
					}

					var $btn = $(this),
						isReserve = $btn.hasClass('on'),
						doReserve = !isReserve,
						//artistNo = $btn.attr('data-artist-no'),
						title = $btn.attr('title').split('알림예약'),
						rsrvType = $btn.attr('data-rsrv-type'),
						csoonNo = $btn.attr('data-csoon-no'),
						csoonType = $btn.attr('data-csoon-type'),
						typeName = "앨범을",
						summCnt = parseInt($btn.attr('data-rsrv-summcnt')), //2013.12.18
						defer, event;

					$btn.trigger((event = $.Event('alarmbefore')), [csoonNo, doReserve]);
					if(event.isDefaultPrevented()){ return; }

					if(csoonType == "MV0002") {
						typeName = "뮤직비디오를";
					} else if(csoonType == "MV0007") {
						typeName = "생방송을";
					} else {
						typeName = "앨범을";
					}

					if( isReserve ) {
						if(!confirm('예약을 취소하시겠습니까? ')) { return; }
						summCnt = summCnt-1 //2013.12.18
						defer = me.cancel(rsrvType, csoonNo, summCnt, typeName);
					} else {
						summCnt = summCnt+1 //2013.12.18
						defer = me.reserve(rsrvType, csoonNo, summCnt, typeName);
					}

					defer.done(function(json) {
						if(json.result === true) {
							$btn.trigger((event = $.Event('alarmchanged')), [rsrvType, csoonNo, doReserve]);
							if(event.isDefaultPrevented()){ return; }
							$btn[doReserve ? 'addClass' : 'removeClass']('on').attr('title', title[0] + [doReserve ? '알림예약 취소' : '알림예약']).html([doReserve ? '<span class="odd_span">예약완료</span>' : '<span class="odd_span">알림예약</span>']);
							$btn.attr('data-rsrv-summcnt', summCnt); //2013.12.18
						} else {
							alert(json.errorMessage);
						}
					}).fail(function(msg){
						alert(msg || '예상치 못한 이유로 작업이 중단되었습니다.');
					});
				});
			},

			_ajax: function(url, defer) {
				$.ajax({
					url: url,
					type : 'POST',
					async : false
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			reserve: function(rsrvType, csoonNo, summCnt, typeName) {
				var defer = $.Deferred();
				if(!csoonNo){ defer.reject(['커밍순 알림 번호가 없습니다.(버튼에 data-csoon-no=""를 넣어주세요.)']); return defer; }
				if(!rsrvType){ defer.reject(['커밍순 예약여부가 없습니다.(버튼에 data-rsrv-type=""를 넣어주세요.)']); return defer; }
				//if(!summCnt){ defer.reject(['커밍순 예약자수가 없습니다.(버튼에 data-rsrv-summCnt=""를 넣어주세요.)']); return defer; }
				this._ajax('/new/comingsoon/reserveCsoon.json?csoonSeq=' + csoonNo + '&reserveYn=Y', defer);
				$('div.csoonNo_'+csoonNo).html(summCnt.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,")+"명이 "+typeName+" 기다리고 있습니다."); //2013.12.18
				alert('커밍순 알림을 예약하셨습니다.\n알림 신청한 컨텐츠가 업데이트 되면, 소식함으로 알려드립니다.');
				return defer;
			},

			cancel: function(rsrvType, csoonNo, summCnt, typeName) {
				var defer = $.Deferred();
				if(!csoonNo){ defer.reject(['커밍순 알림 번호가 없습니다.(버튼에 data-csoon-no=""를 넣어주세요.)']); return defer; }
				if(!rsrvType){ defer.reject(['커밍순 예약여부가 없습니다.(버튼에 data-rsrv-type=""를 넣어주세요.)']); return defer; }
				//if(!summCnt){ defer.reject(['커밍순 예약자수가 없습니다.(버튼에 data-rsrv-summCnt=""를 넣어주세요.)']); return defer; }
				this._ajax('/new/comingsoon/reserveCsoon.json?csoonSeq=' + csoonNo + '&reserveYn=N', defer);
				$('div.csoonNo_'+csoonNo).html(summCnt.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,")+"명이 "+typeName+" 기다리고 있습니다."); //2013.12.18
				alert('커밍순 알림예약을 취소하셨습니다.');
				return defer;
			}
		};
	});
	// 131106_추가

	// 좋아요 처리(버블링 활용)
	WEBSVC.define('WEBSVC.DJCollection', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button: {
					normal: '<span class="odd_span">{TXT}</span>\n<span class="cnt"><span class="none">총건수</span>{CNT}</span>'
				},
				a: {
					normal: '<span class="icon">{TXT}</span>\n<strong class="none">총건수</strong>{CNT}'
				}
			},

			init: function() {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				// 좋아요 버튼
				$doc.on('click.djcollection', '.d_djcol_list button.like, .d_djcol_list a.btn_like', function(e){
					e.preventDefault();


					// 개발에서 이 부분 작업후에 아랫 얼럿을 지워주세요.
					//alert('관련 코드는 melonweb_dj.js의 WEBSVC.DJCollection 모듈에 있습니다.');

					var $btn = $(this),
						djColNo = $btn.attr('data-djcol-no'),
						menuId = $btn.attr('data-djcol-menuId'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					if(!djColNo) {
						alert('좋아요 버튼에 data-djcol-no 속성을 넣어 주세요');
						return
					}

					$btn.trigger((event = $.Event('likebefore')), [djColNo, doLike]);
					if(event.isDefaultPrevented()){ return; }
					$btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
						WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true});
						defer = me.dislike(djColNo,menuId)
					} else {
						defer = me.like(djColNo,menuId)
					}

					defer.done(function(json) {
						var tmpl = '<span class="odd_span">{TXT}</span> <span class="cnt"> <span class="none">총건수</span> {CNT} </span>';
						if(json.result === true) {
							$btn.trigger((event = $.Event('likechanged')), [djColNo, json.data.title, doLike, json.data.count]);
							if(event.isDefaultPrevented()){ return; }

							$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', json.data.title + (doLike ? ' 좋아요 취소' : ' 좋아요'));

							$btn.html(
								tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, json.data.SUMMCNT)
							);

							// 140328_수정
							if ($btn.hasClass('mymusic_like')) {
								doLike && WEBSVC.confirm2('좋아요 반영 되었습니다.<br />마이뮤직 &gt 좋아요에서 확인하세요.<br />내 플레이리스트에도 저장 하시겠습니까?');
							}else {
								doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							};
							// 140328_수정

						} else {
							alert(json.errorMessage);
							//토큰 유효성체크
							if(json.tockenValid != undefined && json.tockenValid == false){
								var pocId = MELON.WEBSVC.POC.getPocId();
								if('WP42' == pocId){
									try {
										MelonAPI.window("forceLogout", "");
									} catch(e) {
									}
								}else{
									location.href = json.returnUrl;
								}
							}

						}
					}).fail(function(msg){
						alert(msg);
					});
				});

			},

			_ajax: function(url, defer) {

				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					dataType: 'json'
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(djColNo,menuId){
				var defer = $.Deferred();

				if(!djColNo){ defer.reject(['DJ플레이리스트 번호가 없습니다.(좋아요 버튼에 data-djcol-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 아이디가 없습니다.(좋아요 버튼에 data-djcol-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + djColNo + '&type=djplaylist&menuId=' + menuId, defer);

				return defer;
			},

			dislike: function(djColNo,menuId) {
				var defer = $.Deferred();

				if(!djColNo){ defer.reject(['DJ플레이리스트 번호가 없습니다.(좋아요 버튼에 data-djcol-no=""를 넣어주세요.)']); return defer; }
				if(!menuId){ defer.reject(['메뉴 아이디가 없습니다.(좋아요 버튼에 data-djcol-menuId=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + djColNo + '&type=djplaylist&menuId=' + menuId, defer);

				return defer;
			}
		};
	});

	// 131126_추가
	WEBSVC.define('WEBSVC.MusicstoryList', function() {
		var _isInited = false;

		return {
			// 페이지마다 좋아요 버튼의 마크업이 틀려서 템플릿으로 처리
			template: {
				button: {
					normal: '<span>{TXT}</span>'
				}
			},

			init: function(opts) {
				// 한번만 실행되도록..
				if(_isInited){ return; }
				_isInited = true;

				var me = this;
				opts = opts || {};

				// 좋아요 버튼
				$doc.on('click.musicstorylist', '.d_musicstory_list *[data-musicstory-no]', function(e){
					e.preventDefault();
					e.stopPropagation();

					// 개발에서 이 부분 작업후에 아랫 얼럿을 지워주세요.
					//alert('관련 코드는 melonweb_comm_ajax.js의 WEBSVC.MusicstoryList 모듈에 있습니다.');

					var $btn = $(this),
						tmpl = opts.tmpl || me.template[ ($btn.attr('data-tmpl-name') || 'normal') ],
						musicstoryNo = $btn.attr('data-musicstory-no'),
						title = $btn.attr('title').split(' 좋아요'),
						isLike = $btn.hasClass('on'), doLike = !isLike,
						addComma = WEBSVC.number.addComma,
						$target = (function(){
							var targetId = $btn.attr('data-target-id');
							if(!targetId) { return $btn; }
							targetId = targetId.substr(0, 1) === '#' ? targetId : '#' + targetId;
							return $(targetId);
						})(),
						defer, event;

					$btn.trigger((event = $.Event('likebefore')), [musicstoryNo, doLike]);
					if(event.isDefaultPrevented()){ return; }
					$btn.trigger('mouseleave'); //140514_추가
					if(isLike) {
					//	WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true});
						defer = me.dislike(musicstoryNo)
					} else {
						defer = me.like(musicstoryNo)
					}
					defer.done(function(json) {
						if(json.result === true) {
							$btn.trigger((event = $.Event('likechanged')), [musicstoryNo, title[0], json.data.title, doLike, json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,")]);
							if(event.isDefaultPrevented()){ return; }
							$btn[doLike ? 'addClass' : 'removeClass']('on').attr('title', title[0] + (doLike ? ' 좋아요 취소' : ' 좋아요'));
//							$btn.html(
//								tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요'))
//							);

							//4.0리스트버튼인경우
							if($btn.hasClass('d_list4x_btn')){
								var tmpl = '<span class="odd_span">좋아요</span> <span class="cnt"> <span class="none">총건수</span> {CNT} </span>';
								$btn.html(
										tmpl.replace(/\{TXT\}/g, (doLike ? '좋아요 취소' : '좋아요')).replace(/\{CNT\}/g, json.data.SUMMCNT)
									);
							}else{
								$target.html(json.data.SUMMCNT.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,"));
							}


							doLike && WEBSVC.alert2('좋아요 반영되었습니다.',{opener :$btn, removeOnClose:true});
							//취소 액션이 성공적으로 이루어진 이후에 메시지 처리...
							isLike && WEBSVC.alert2('좋아요 취소되었습니다.',{opener :$btn, removeOnClose:true});
						} else {
							alert(json.errorMessage);
							//토큰 유효성체크
							if(json.tockenValid != undefined && json.tockenValid == false){
								var pocId = MELON.WEBSVC.POC.getPocId();
								if('WP42' == pocId){
									try {
										MelonAPI.window("forceLogout", "");
									} catch(e) {
									}
								}else{
									location.href = json.returnUrl;
								}
							}

						}
					}).fail(function(msg){
						alert(msg);
					});
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				if(!MELON.WEBSVC.POC.login.isMelonLogin()) {
					//MELON.WEBSVC.POC.login.loginPopupLayerd(url); 리턴url이 아니기 때문에 url 삭제
					MELON.WEBSVC.POC.login.loginPopupLayerd('');
					return;
				}

				$.ajax({
					url: url,
					type : 'POST',
					dataType: 'json'
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},

			like: function(musicstoryNo){
				var defer = $.Deferred();
				if(!musicstoryNo){ defer.reject(['뮤직스토리 리스트 번호가 없습니다.(좋아요 버튼에 data-musicstory-no=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_insertLike.json?contsId=' + musicstoryNo + '&type=musicstory', defer);

				return defer;
			},

			dislike: function(musicstoryNo) {
				var defer = $.Deferred();

				if(!musicstoryNo){ defer.reject(['뮤직스토리 리스트 번호가 없습니다.(좋아요 버튼에 data-musicstory-no=""를 넣어주세요.)']); return defer; }
				this._ajax('/mymusic/common/mymusiccommon_deleteLike.json?contsId=' + musicstoryNo + '&type=musicstory', defer);

				return defer;
			}
		};
	});
	// 131126_추가

	// 140327_추가
	WEBSVC.define('WEBSVC.ArtistNews', function() {
		var _isInited = false,
			addComma = WEBSVC.number.addComma;

		return {

			// 취소가능 여부
			canCancel: false,

			init: function(options){
				if(_isInited){ return; }
				_isInited = true;

				var me = this;

				$.extend(me, options);

				$doc.on('click.artistnews.btn_feednone2', '.d_artist_news *[data-artistnews-no]', function(e) {
					e.preventDefault();
					e.stopPropagation();


					var $btn = $(this),
						isReception = $btn.hasClass('on'), doReception = !isReception,
						sendrKey = $btn.attr('data-artistnews-no'),
							contentsId = $btn.attr('data-contentsnews-no'),
							contentsTypeCode = $btn.attr('data-contentsnews-type'),
							defer, event;


					$btn.trigger((event = $.Event('receptionbefore')), [sendrKey, doReception]);
					if(event.isDefaultPrevented()){ return; }


					if(!isMelonLogin()) {//로그인전이라면
						MELON.WEBSVC.loginLayer({userid: 'melon'});
						return defer;
					} else {
						if(!contentsTypeCode){
							if(isReception) {
								//WEBSVC.alert2('이미 소식 받지 않기를 설정한<br />아티스트 입니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
								defer = me.nonreception(sendrKey)
							} else {
								defer = me.reception(sendrKey)
								/*$btn.trigger((event = $.Event('receptionchanged')), [sendrKey, doReception, 'no']);
                if(event.isDefaultPrevented()){ return; }
                WEBSVC.confirm2('앞으로 이 아티스트의 소식을<br />받지 않습니다.').on('ok', function(){
                  $("a[data-artistnews-no='"+sendrKey+"']")[doReception ? 'addClass' : 'removeClass']('on');
                  setTimeout(function() {
                    WEBSVC.alert2('설정이 완료되었습니다.<br />소식함 > 설정에서 다시 소식받기<br />설정이 가능합니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true})
                  },1);
                  defer = me.reception(sendrKey)
                }).on('cancel', function(){
                  return false;
                });*/
							}
						}else{
							if(isReception) {
								//WEBSVC.alert2('이미 소식 받지 않기를 설정한<br />아티스트 입니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true});
								defer = me.nonreceptionContents(sendrKey,contentsId,contentsTypeCode)
							} else {
								defer = me.receptionContents(sendrKey,contentsId,contentsTypeCode)
								/*$btn.trigger((event = $.Event('receptionchanged')), [sendrKey, doReception, 'no']);
                if(event.isDefaultPrevented()){ return; }
                WEBSVC.confirm2('앞으로 이 아티스트의 소식을<br />받지 않습니다.').on('ok', function(){
                  $("a[data-artistnews-no='"+sendrKey+"']")[doReception ? 'addClass' : 'removeClass']('on');
                  setTimeout(function() {
                    WEBSVC.alert2('설정이 완료되었습니다.<br />소식함 > 설정에서 다시 소식받기<br />설정이 가능합니다.',{opener :$btn, removeOnClose:true, overlayNotClose:true})
                  },1);
                  defer = me.reception(sendrKey)
                }).on('cancel', function(){
                  return false;
                });*/
							}
						}

					}
					/* 140813_modify */
					defer.done(function(json) {
						if(json.rtnMap.STATUS == "1") {
							$btn.trigger((event = $.Event('receptionchanged')), [sendrKey, doReception]);
							if(event.isDefaultPrevented()){ return; }
							if(json.rtnMap.BLOCKYN == "Y") {
								$("*[data-artistnews-no='"+sendrKey+"']")[doReception ? 'addClass' : 'removeClass']('on').attr('title', '피드 받기').find('span').text('피드 받기');
								WEBSVC.alert2('<p style="width:130px;">피드 받지 않기 <br>설정이 완료되었습니다.</p>',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							} else {
								$("*[data-artistnews-no='"+sendrKey+"']")[doReception ? 'addClass' : 'removeClass']('on').attr('title', '피드 안받기').find('span').text('피드 안받기');
								WEBSVC.alert2('<p style="width:130px;">피드 받기 설정이<br> 완료되었습니다.</p>',{opener :$btn, removeOnClose:true, overlayNotClose:true});
							}
						} else {
							alert(json.errorMessage);
						}
					}).fail(function(msg){
						alert(msg || '예상치 못한 이유로 작업이 중간되었습니다.');
					});
					/* //140813_modify */
				});

			},

			_ajax: function(url, defer) {
				// 로그인 체크
				//if(!WEBSVC.Auth.isMelonLogin()) {
				// defer.reject('로그인 후에 이용해 주세요.');
				//	return defer;
				//}

				$.ajax({
					url: url,
					dataType: 'json'
				}).done(function(json) {
					defer.resolve.apply(null, arguments);
				}).fail(function() {
					defer.reject(['알수 없는 이유로 작업을 중단하였습니다.']);
				});
			},


			reception: function(sendrKey) {
				//소식안받기
				var defer = $.Deferred();
				if(!sendrKey){ defer.reject(['아티스트 번호가 없습니다.(아티스트의 소식 버튼에 data-artistnews-no=""를 넣어주세요.)']); return defer; }
				this._ajax('/feed/newsBlockSender.json?sendrKey=' + sendrKey + '&type=off', defer);

				return defer;
			},

			nonreception: function(sendrKey) {
				//소식받기
				var defer = $.Deferred();
				if(!sendrKey){ defer.reject(['아티스트 번호가 없습니다.(아티스트의 소식 버튼에 data-artistnews-no=""를 넣어주세요.)']); return defer; }
				this._ajax('/feed/newsBlockSender.json?sendrKey=' + sendrKey + '&type=on', defer);

				return defer;
			},

		receptionContents: function(sendrKey,contentsId,contentsTypeCode) {
			//소식안받기
			var defer = $.Deferred();
			if(!sendrKey){ defer.reject(['아티스트 번호가 없습니다.(아티스트의 소식 버튼에 data-artistnews-no=""를 넣어주세요.)']); return defer; }
			this._ajax('/feed/newsBlockContents.json?sendrKey=' + sendrKey + '&type=off&contsId='+contentsId+"&contsTypeCode="+contentsTypeCode , defer);

			return defer;
		},

		nonreceptionContents: function(sendrKey,contentsId,contentsTypeCode) {
			//소식받기
			var defer = $.Deferred();
			if(!sendrKey){ defer.reject(['아티스트 번호가 없습니다.(아티스트의 소식 버튼에 data-artistnews-no=""를 넣어주세요.)']); return defer; }
			this._ajax('/feed/newsBlockContents.json?sendrKey=' + sendrKey + '&type=on&contsId='+contentsId+"&contsTypeCode="+contentsTypeCode, defer);

			return defer;
		}
		};
	});
	// 140327_추가

	// 최신 토글 슬라이더
	WEBSVC.define('PBPGN.AjaxToggle', function() {
		// 슬라이더
		var AjaxToggle = Class({
			name: 'AjaxToggle',
			$extend: MELON.PBPGN.View,
			$statics: {
				ON_CHANGED: 'ajaxtogglechanged',
				ON_DISABLED: 'ajaxtoggledisabled'
			},
			defaults: {
				selectedIndex: 0,
				selectEvent: 'click'
			},
			selectors: {
				tabs: '',
				nowpages: '',
				totalpages: '',
				contents: '',
				orderlayer:''
			},
			// 생성자
			initialize: function(el, options) {
				var me = this;
				if(me.supr(el, options) === false) { return; }

				me.nowpage = 1;
				// 버튼에 설정되어 있는 최대값과 뷰타입 가져오기.
				me.maxpage = me.$tabs.attr('data-limit-count');
				me.type = me.$tabs.attr('data-view-type');
				//20131104 hmh 조회 하는 키값 (앨범ID,아티스트ID,플레이리스트seq,DJ플레이리스트seq 등)
				me.contsId = me.$tabs.attr('data-view-contsId');
				me.orderby = me.$tabs.attr('data-orderby-type');

				me.$totalpages.html(me.maxpage);

				if ( parseInt(me.maxpage) === 1 ) {
					me.$tabs.addClass('disabled');
				} else {
					me.$tabs.addClass('disabled');
					me.$tabs.eq(1).removeClass('disabled');
				}
				me.on(me.options.selectEvent, me.options.selectors.tabs, function(e) {
					e.preventDefault();
					if($(this).hasClass('disabled')) return;

					if ( me.$tabs.index(this) === 0 && me.nowpage > 1 ) {
						me.nowpage = me.nowpage - 1;
					} else if ( me.$tabs.index(this) === 1 && me.nowpage < me.maxpage ) {
						me.nowpage = me.nowpage + 1;
					}

					me._toggleButtons();
					me._ajax();
					me.$nowpages[0].innerHTML = me.nowpage;
				});
				//2013.11.12 류근용
				if( me.options.selectors.orderlayer != '' && me.options.selectors.orderlayer != undefined) {
					me.on(me.options.selectEvent, me.options.selectors.orderlayer, function(e) {
						e.preventDefault();
						me.orderby = me.$tabs.attr('data-orderby-type');
						me.nowpage = 1;
						me._toggleButtons();
						me._ajax();
						me.$nowpages[0].innerHTML = 1;

						if ( parseInt(me.maxpage) === 1 ) {
							me.$tabs.addClass('disabled');
						} else {
							me.$tabs.addClass('disabled');
							me.$tabs.eq(1).removeClass('disabled');
						}

					});
				}
			},

			_ajax: function() {
				var me = this;
				// 개발에서는 이부분 수정 후 사용하시면 됩니다. - 뷰타입에 따라 Ajax로 가져오는 URL을 분리하던가 인자값으로 넘겨서 내부에서 처리하시면 됩니다.
				// 로그인 체크
				//if(!WEBSVC.Auth.isMelonLogin()) {
				// defer.reject('로그인 후에 이용해 주세요.');
				//	return;
				//}

				if ( me.type === 'like' ) {
					var url = '/wsg/script/likUserList.html';
				}
				//2013.11.05 류근용 앨범>연관앨범 탭
				else if ( me.type === 'relationAlbum' ) {
					var url = '/album/relationAlbum.htm';
				}
				//2013.11.05 앨범 >좋아요한 사람 탭
				else if ( me.type === 'withLikeUser' ) {
					var url = '/album/withLikeUser.htm';
				}
				//2013.11.05 곡 >좋아요한 사람 탭
				else if ( me.type === 'withLikeUserSong' ) {
					var url = '/song/withLikeUserSong.htm';
				}
				else if ( me.type === 'withLikeUserPlayListDetail' ) {
					var url = '/artist/withLikeUserPlayListDetail.htm';
				}
				//20131104 hmh DJ플레이리스트 추가
				else if ( me.type === 'djCol' ) {
					var url = '/mymusic/djcollection/mymusicdjplaylistview_listPagingUserLike.htm';
				}
				else if ( me.type === 'tvNewThemeList' ) {
					var url = '/wsg/script/tvNewThemeList.html';
				}
				else if( me.type === 'playlist'){
					var url = '/mymusic/playlist/mymusicplaylistview_listPagingUserLike.htm';
				}
				$.ajax({
					url: url,
					dataType: 'html',
					data : {
						viewType: me.type,
						//20131104 hmh contsId 추가
						contsId	: me.contsId,
						viewPage: me.nowpage,
						orderBy: me.orderby
					}
				}).done(function(html) {
					me.$contents.html(html);
				});
			},

			_toggleButtons: function(){
				var me = this;
				if ( parseInt(me.nowpage) === 1 ) {
					me.$tabs.eq(0).addClass('disabled');
					me.$tabs.eq(1).removeClass('disabled');
				} else if ( parseInt(me.nowpage) === parseInt(me.maxpage) ) {
					me.$tabs.eq(0).removeClass('disabled');
					me.$tabs.eq(1).addClass('disabled');
				} else {
					me.$tabs.removeClass('disabled');
				}
			},

			update: function(){
				var me = this;

				me.$contents = me.$el.find(me.options.selectors.contents);

				me.maxpage = me.$contents.size() - 1;
				me.$nowpages[0].innerHTML = (Math.min(me.nowpage, me.maxpage+1));
				me.$totalpages.html(me.maxpage+1);

				me._toggleButtons();
			}
		});

		WEBSVC.bindjQuery(AjaxToggle, 'ajaxToggle');  // 이 부분을 실행하면 $(..).tabs()로도 호출이 가능해진다.
		return AjaxToggle;
	});

})(jQuery, MELON.WEBSVC, MELON.PBPGN);


(function($, WEBSVC, PBPGN, undefined) {
	$(function() {

		// 곡리스트 글로벌 이벤트 바인딩
		WEBSVC.SongList.init();

		// 앨범리스트 글로벌 이벤트 바인딩
		WEBSVC.AlbumList.init();

		// 영상리스트 글로벌 이벤트 바인딩
		WEBSVC.VideoList.init();

		// 플레이리스트 글로벌 이벤트 바인딩
		MELON.WEBSVC.PlayList.init();

		// start: 131202
		// GNB 빌드
		(function($header){
			if(!$header.length) { return; } // 페이지에 #header가 없으면 빌드 취소(팝업인 경우) or 검색페이지의 경우 빌드 취소

			var bannerUrl = '/gnb/banner_list_logout.htm';
			if(isMelonLogin()){
				if (getProdName() != ""){
					bannerUrl = "/gnb/banner_list_paid.htm";
				} else {
					bannerUrl = "/gnb/banner_list_free.htm";
				}
			}

			new PBPGN.GNB.MelonGNB($header, {
				// start: 140603_수정
				contentsUrl: '/gnb/list.htm',		// 실시간키워드, 개인화영역 배너
				bannerUrl: bannerUrl,				// 배너 2부분
				newsUrl: '/gnb/news_inform.htm'		// 소식함 갯수
				// end: 140603_수정
			});

//			if(MELON.WEBSVC.POC.login.isMelonLogin()) {
//				new PBPGN.GNB.MelonGNB($header, {
//					newsCountUrl: '/feed/feedCount.json'		// 소식함 갯수
//					newsCountUrl: '/gnb/list.htm'		// gnb설정
//				});
//			}
		})($('#header'));

		// 개인화 영역
		(function($idBox) {
			if(!$idBox.length) { return; } // 페이지에 #id_box가 없으면 빌드 취소(팝업인 경우)

			// start: 131210_수정 : 해상도 전화될 때 로그인영역 텍스트를 동기화 시켜준다.///////////////////////////////////////////////
			// 로그아웃 상태일 때는, 개인화영역 모듈을 실행하지 않기 때문에 리사이징 이벤트에서 처리해야 한다.
			if(!isMelonLogin()) {
				var $inbox = $idBox.find('div.inbox div.input_area'),
					$outbox = $idBox.find('div.expn div.input_area'),
					isWideMode = WEBSVC.util.getWinWidth() > 1280;

				$(window).on('resize.personalarea', function(e) {
					var _isWideMode = WEBSVC.util.getWinWidth() > 1280,
						$src, $target;
					if(_isWideMode != isWideMode) {		// 개인화영역의 모양이 바뀔 때 비로소 싱크를 맞춤.(부하 최소화)
						isWideMode = _isWideMode;
						if(isWideMode) {
							$src = $inbox, $target = $outbox;
						} else {
							$src = $outbox, $target = $inbox;
						}
						setTimeout(function(){ // freezing 현상을 피하기 위함
							$target.find('input:text').val($src.find('input:text').val());
							$target.find('input:password').val($src.find('input:password').val());
							$target.find('input:checkbox').prop('checked', $src.find('input:checkbox').prop('checked'));
						}, 0);
					}
				});
				// 로그아웃 상태일 때, 개인화영역 모듈을 실행하지 않는다.
				return;
			}
			//end: 131210_수정 //////////////////////////////////////////////////////////////////////////////////////////////////////////////

			var url = '/gnb/feed_list.htm?memberKey=' + getMemberKey() + '&memberNickName=' + encodeURI(encodeURIComponent(getMemberNickName())); //새로운 뉴스
			var url2 = '/gnb/friend_list.htm?memberKey=' + getMemberKey(); //최근 활동 내역

			// 렌더링 중 freeze 현상이 있을 때, setTimeout를 이용하면 효과가 있다..(my tip..ㅎ)//////////////////////////////////////////
			setTimeout(function() {
				new PBPGN.Personal.PersonalArea($idBox, {
					newsUrl: url,							// 소식함 목록
					activeFriendsUrl: url2,					// 활동중인 친구
					isSaveCookie: true,					// 서버데이타를 기준으로 펼침/접힘 설정을 하고자 할 경우 false 로 해놓고 MelonPersonal의 isExpand에 서버데이타를 셋팅해주면 된다.
					autoexpand: MelonPersonal.isAutoExpand,
					expand: !!MelonPersonal.isExpand, //(WEBSVC.Cookie.get('personalexpand') === 'true'),		// 초기에 펼져지게 할 것인가(쿠키에서 가져옴)
					personal: MelonPersonal.isPersonal, // Personal 영역 확장 여부
					narrowMinium: 690,			// 1024이하 모드에서 최소 높이
					narrowMaxium: 800,		// 1024이하 모드에서 최대 높이
					wideMinium: 500				// 1024이상 모드에서 최소 높이
				});
			}, 0);
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

			// sns 연동/해제//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
			$idBox.on('click', 'button.sns_facebook', function(){
				location.href = "https://member.melon.com/muid/web/sns/sns_inform.htm";
//				var $btn = $(this);
//
//				if($btn.hasClass('d_conn')) { // 연동하기
//					// $.ajax({
//					//		url: '',
//					//		dataType: 'json'
//					// }).done(function(json) {
//						// if(json.success) {
//							alert('연동작업 - 서버');
//							$btn.attr('title', '페이스북 해제하기').replaceClass('d_conn', 'd_deconn').html('<span class="cancel">페이스북 해제하기</span>');
//						// }
//					// });
//				} else {								// 해제하기
//						// $.ajax({
//					//		url: '',
//					//		dataType: 'json'
//					// }).done(function(json) {
//						// if(json.success) {
//							alert('해제작업 - 서버');
//							$btn.attr('title', '페이스북 연동하기').replaceClass('d_deconn', 'd_conn').html('<span>페이스북 연동하기</span>');
//						// }
//					// });
//				}
			});
			////////////////////////////////////////////////////////////////////////////////////////////////////////

		})($('#id_box'));
		// end: 131209_수정
	});

})(jQuery, MELON.WEBSVC, MELON.PBPGN);

//검색 키워드 자동완성 관련
jQuery(function($) {
	var $autocompleteToggle   = $('#top_search_autocomplete_toggle');
	var $autocompleteTemplate = $('#top_search_autocomplete_template');

	if($autocompleteToggle.length > 0){
		// 컨텐츠 타입
		var contType = $('#divCollection').find('.on').attr('data-coll');

		// 검색 필드
		var $searchInput = $('#top_search');
		$searchInput.autocomplete({ delay: 50 });
		$searchInput.keyup(function(event) {
			// 눌려진 키가 위/아래 화살표인지 여부를 기억한다.
			$searchInput.data('isUpDownArrow', (event.which == 38 || event.which == 40));
		});

		// 검색 필드에 자동완성 기능 설치
		$searchInput.autocomplete({
			appendTo: '#top_search_autocomplete',
			minLength: 1,
			source: function(request, response) {
				var query = request.term;

				$.ajax({
					//url: '/search/keyword/index.json',
					//url: '/search/keyword/index.json',
					url: '/search/keyword/index.json',
					type: 'get',
					data: {
						contType: contType,
						query: encodeURIComponent(query)
					},
					//dataType: 'json',
					dataType: 'jsonp',
					jsonp: 'jscallback',
					success: function(data) {
						var items = [];

						var artists  = data.ARTISTCONTENTS  || [];
						var songs    = data.SONGCONTENTS    || [];
						var albums   = data.ALBUMCONTENTS   || [];
						var keywords = data.KEYWORDCONTENTS || [];

						if (artists.length > 0 || songs.length > 0 || albums.length > 0) {
							// 아티스트 검색 결과
							$.each(artists, function(i, artist) {
								// 3개까지만 표시
								if (i >= 3) return false;

								items.push({
									category: 'artist',
									categoryName: '아티스트',
									categoryImg: '01',
									categoryImgWidth: 48,
									categoryImgHeight: 13,
									query: query,
									value: artist.ARTISTID,
									label: artist.ARTISTNAME,
									labelDp: artist.ARTISTNAMEDP.replace(/<b>/gi,'<strong>').replace(/<\/b>/gi,'</strong>'),
									img: artist.ARITSTIMG,
									info: [artist.NATIONALITYNAME, artist.SEX, artist.ACTTYPENAMES].filter(function(x) {return x != null && x != '';}).join('/')
								});
							});

							// 곡 검색 결과
							$.each(songs, function(i, song) {
								// 3개까지만 표시
								if (i >= 3) return false;

								items.push({
									category: 'song',
									categoryName: '곡',
									categoryImg: '02',
									categoryImgWidth: 12,
									categoryImgHeight: 12,
									query: query,
									value: song.SONGID,
									label: song.SONGNAME,
									labelDp: song.SONGNAMEDP.replace(/<b>/gi,'<strong>').replace(/<\/b>/gi,'</strong>'),
									img: song.ALBUMIMG,
									info: song.ARTISTNAME
								});
							});

							// 앨범 검색 결과
							$.each(albums, function(i, album) {
								// 2개까지만 표시
								if (i >= 2) return false;

								items.push({
									category: 'album',
									categoryName: '앨범',
									categoryImg: '03',
									categoryImgWidth: 23,
									categoryImgHeight: 13,
									query: query,
									value: album.ALBUMID,
									label: album.ALBUMNAME,
									labelDp: album.ALBUMNAMEDP.replace(/<b>/gi,'<strong>').replace(/<\/b>/gi,'</strong>'),
									img: album.ALBUMIMG,
									info: album.ARTISTNAME
								});
							});
						} else if (keywords.length > 0) {
							// 키워드 검색 결과
							$.each(keywords, function(i, keyword) {
								// 15개까지만 표시
								if (i >= 15) return false;
								var className = '';
								if(i == 0) className ='first_child';

								items.push({
									query: query,
									value: keyword.KEYWORD,
									label: keyword.KEYWORD,
									labelDp: keyword.KEYWORDDP.replace(/<b>/gi,'<strong>').replace(/<\/b>/gi,'</strong>'),
									className : className
								});
							});
						} else if (data.STATUS == '3001') {
							// 결과 없음
							items.push({
								value: 0,
								label: ''
							});
						}else{
							// 결과 없음
							items.push({
								value: 0,
								label: ''
							});
						}

						response(items);
						//ul 태그 position:relative걸리는 버그 수정
						$('#top_search_autocomplete >ul').attr('style','position:relative; left:0; top:0;');
					}
				});
			},
			// 검색 직전에
			search: function(event, ui) {
				// 눌려진 키가 위/아래 화살표이고,
				if ($searchInput.data('isUpDownArrow')) {
					// 기존 검색 결과가 표시중이면
					if ($searchInput.data('ui-autocomplete').menu.element.is(':visible')) {
						// 기존 검색 결과의 네비게이션을 위해, 새로운 검색을 중지한다.
						// Chrome에서, 한글 입력후 위/아래 화살표를 누르면, IME가 포커스를 잃으면서 검색이 되는 현상을 방지한다.
						return false;
					}
				}
			},
			// 아이템이 포커스되면
			focus: function(event, ui) {
				// 키보드로 포커스된 경우에만
				$searchInput.data('isUpDownArrow',(event.which == 38 || event.which == 40));
				if (event.keyCode) {
					// 검색 필드 값 업데이트
					$searchInput.val(ui.item.label);
				}

				return false;
			},
			// 아이템이 선택되면
			select: function(event, ui) {
				// 검색 필드 값 지우기
				var srwd = $searchInput.val();
				$searchInput.val('');

				var item = ui.item;
				if (item.category == 'artist') {
					// 아티스트 선택시, 아티스트 상세로 이동
					var artistId = item.value;
					melon.link.goSearchLog('web_acartist', 'ARTIST', 'AR', srwd, artistId);
					melon.link.goArtistDetail(artistId);
				} else if (item.category == 'song') {
					// 곡 선택시, 곡 상세로 이동
					var songId = item.value;
					melon.link.goSearchLog('web_acsong', 'SONG', 'SO', srwd, songId);
					melon.link.goSongDetail(songId);
				} else if (item.category == 'album') {
					// 앨범 선택시, 앨범 상세로 이동
					var albumId = item.value;
					melon.link.goSearchLog('web_acalbum', 'ALBUM', 'AL', srwd, albumId);
					melon.link.goAlbumDetail(albumId);
				} else {
					// 키워드 선택시, 통합검색으로 이동
					var keyword = item.value;
					melon.link.goTotalSearch(keyword,contType,'searchFrm','');
				}

				return false;
			},
			// 자동완성이 표시되면
			open: function(event, ui) {
				// 토글 버튼을 연다.
				$autocompleteToggle.removeClass('close').addClass('open');
			},
			// 자동완성이 사라지면
			close: function(event, ui) {
				// 토글 버튼을 닫는다.
				$autocompleteToggle.removeClass('open').addClass('close');

				// 자동완성이 열린 상태에서 토글 버튼 클릭시,
				// blur로 자동완성이 닫힌후, 토글 버튼으로 다시 자동완성이 열리는 현상 방지
				$autocompleteToggle.attr({disabled:'disabled'});
				setTimeout(function() { $autocompleteToggle.removeAttr('disabled'); }, 500);

				return false;
			}
		});

		// 자동완성 토글 버튼 클릭시
		$autocompleteToggle.click(function() {
			// 자동완성 토글이 닫힌 상태면
			if ($(this).hasClass('close')) {
				var $ul = $('#top_search_autocomplete > ul');

				// 기존 자동완성이 존재하면, 그것을 표시한다.
				if ($ul.find('li').length > 0) {
					$ul.show();

					// 토글 버튼을 연다.
					$autocompleteToggle.removeClass('close').addClass('open');

					// 검색 필드에 포커스 (blur시 자동완성이 닫히도록 함)
					$searchInput.focus();

					// 기존 자동완성이 없으면, 검색을 한다.
				} else {
					$searchInput.autocomplete('search');
				}
				// 자동완성 토글이 열린 상태면
			} else if ($(this).hasClass('open')) {
				// 자동완성을 닫는다.
				$searchInput.autocomplete('close');
			}
		});

		// 자동완성 메뉴 리사이즈시
		$searchInput.data('ui-autocomplete')._resizeMenu = function() {
			// autocomplete가 추가한 width 속성을 제거한다. (너비는 CSS를 따른다.)
			var ul = this.menu.element;
			ul.removeAttr('width');
		};

		// 자동완성의 아이템을 렌더링 한다.
		$searchInput.data('ui-autocomplete')._renderItem = function($ul, item) {
			var $li;
			if (item.category) {
				// 썸네일 아이템
				$li = $autocompleteTemplate.find('.thumb_result li.class02').clone();
				$li.find('> a').attr({title:item.label+' - 페이지 이동'});
				$li.find('.autocomplete-img').attr({src:item.img, alt:item.label});
				$li.find('.autocomplete-img').on('error', function(e){
					if (item.category == 'artist') {
						WEBPOCIMG.defaultArtistImg(this);
					} else {
						WEBPOCIMG.defaultAlbumImg(this);
					}
				});
				$li.find('.autocomplete-label').html(item.labelDp);
				$li.find('.autocomplete-info').html(item.info);
				$('#top_search_autocomplete').show();
			} else if (item.value) {
				// 텍스트 아이템
				$li = $autocompleteTemplate.find('.text_result:first li').clone();
				$li.addClass(item.className);
				$li.find('.autocomplete-label').html(item.label);
				$('#top_search_autocomplete').show();
			} else {
				// 결과 없음
				$li = $autocompleteTemplate.find('.text_result li.result_none').clone();
				$('#top_search_autocomplete').hide();
				//return;
			}
			return $li.appendTo($ul);
		};

		// 자동완성 메뉴를 렌더링 한다.
		$searchInput.data('ui-autocomplete')._renderMenu = function($ul, items) {
			if (items && items.length > 0) {
				// 텍스트 형태인지 썸네일 형태인지 설정한다.
				if (items[0].category) {
					$ul.removeClass('text_result').addClass('thumb_result');
				} else {
					$ul.removeClass('thumb_result').addClass('text_result');
				}

				var that = this;
				var currentCategory = '';
				$.each(items, function(index, item) {
					if (item.category && item.category != currentCategory) {
						// ul에 카테고리 li 추가
						var $li = $autocompleteTemplate.find('.thumb_result li.cate').clone();

						if(index == 0) var firstClass = " first_child";

						var cateHtml = '<img src="//cdnimg.melon.co.kr/resource/image/web/common/tit_auto_complete'+item.categoryImg+'.png" width="'+item.categoryImgWidth+'" height="'+item.categoryImgHeight+'" alt="'+item.categoryName+'">';
						$ul.append($li.addClass('ui-autocomplete-category' + firstClass).html(cateHtml));

						currentCategory = item.category;
					}
					that._renderItemData($ul, item);
				});
			}
		};

		//검색버튼 클릭
		$('.search_m').click(function(){
			goSearch();
		});

		//검색엔터키
		$searchInput.keydown(function(e){
			//if(e.keyCode == 13)goSearch();
		});

		$searchInput.focus(function(){
			//if($("#keywordLink").val() != '' || $searchInput.val()=='검색어를 입력하세요'){
			if($("#keywordLink").val() != ''){
				$searchInput.val('');
				$("#keywordLink").val('');
			}
		});

		goSearch = function(){

			var query = $.trim($searchInput.trimVal());
			//키워드 링크가 있으면 redirect
			if($.trim($("#keywordLink").val()) != ""){
				location.href = $("#keywordLink").val();
				return;
			}

			//if(query == "" || query == "검색어를 입력하세요"){
			if(query == ""){
				alert("검색어를 입력하세요.  ");
				$searchInput.focus();
				return;
			}

			// [MELON-4753] [PC웹] 실시간 급상승 키워드 로직을 위한 로깅 작업 요청
			var formObj = $('#searchFrm');
			var linkOrText = formObj.find('[name=linkOrText]');
			if($(linkOrText).val() == undefined) {

				var $linkOrText = $('<input type="hidden" id="linkOrText" name="linkOrText" value="T"/>')
				$linkOrText.appendTo(formObj);
			}


			MELON.WEBSVC.POC.link.goTotalSearch(query,contType,'searchFrm','');
		};

		//검색형 GNB의 경우 setDeaultKeyword 실행하지 않음
		var searchGnbYn = $('#searchFrm').find('[name=searchGnbYn]').val();
		if(typeof searchGnbYn == "undefined"){
			//기본검색어가 설정되기 전 입력을 막기위한 처리
			$('#top_search').hide();
//			$('#top_search_autocomplete_toggle').hide();

			var locationInfo = location.host;
			var PHASE_SANDBOX = 'sandbox-';
			var PHASE_CBT = 'cbt-';
			var PHASE_REL = 'rel-';

			var deployPhaseDomain = 'www.melon.com';
			if(locationInfo.indexOf(PHASE_SANDBOX) > -1){
				deployPhaseDomain = PHASE_SANDBOX + 'www.melon.com';
			} else if(locationInfo.indexOf(PHASE_CBT) > -1){
				deployPhaseDomain = PHASE_CBT + 'www.melon.com';
			} else if(locationInfo.indexOf(PHASE_REL) > -1){
				deployPhaseDomain = PHASE_REL + 'www.melon.com';
			}

			$.ajax({
				url: "/gnb/mainKeyword.json"
			}).done(function(data) {
				var mainKeyword = data.mainKeyword;
				var keyword_info		= '';
				var keyword_link		= '';
				var keyword_srchtype	= '';
				if (mainKeyword != null) {
					keyword_info		= mainKeyword.SRCHWORD;
					keyword_link		= mainKeyword.SRCHURL.replace('www.melon.com', deployPhaseDomain);
					keyword_srchtype	= mainKeyword.SRCHTYPE;

					if (keyword_link.indexOf('?') >= 0 ) {
						keyword_link += "&WLFC="+keyword_srchtype+"SEARCH";
					} else {
						keyword_link += "?WLFC="+keyword_srchtype+"SEARCH";
					}
					//$searchInput.attr("placeholder",keyword_info);
					$searchInput.val(keyword_info);
					$("#keywordLink").val(keyword_link);

					//기본검색어가 설정되기 전 입력을 막기위한 처리
					$('#top_search').show();
					$('.search_dj .input_text').val('');
//					$('#top_search_autocomplete_toggle').show();
				}else{
					//$searchInput.attr("placeholder","검색어를 입력하세요");
					//기본검색어가 설정되기 전 입력을 막기위한 처리
					$('#top_search').show();
//					$('#top_search_autocomplete_toggle').show();
					//$searchInput.val("검색어를 입력하세요");
					$searchInput.attr("placeholder","검색어를 입력하세요");
				}

			}).fail(function() {
				//$searchInput.attr("placeholder","검색어를 입력하세요");
				//기본검색어가 설정되기 전 입력을 막기위한 처리
				$('#top_search').show();
//				$('#top_search_autocomplete_toggle').show();
				//$searchInput.val("검색어를 입력하세요");
				$searchInput.attr("placeholder","검색어를 입력하세요");
			});
		}

		//$('#gnb').trigger('focus');
	}
});
//검색 키워드 자동완성 관련
