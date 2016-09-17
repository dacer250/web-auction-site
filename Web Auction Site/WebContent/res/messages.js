window.current_page = 1;
window.total_pages = 1;
window.msg_type = "received";

$(document).ready(function(){
	$("#btn-show-send").click(function(){
		$("#message-form").toggle(1000);
	});
	$("#message-form").submit(function(e){
		send_message();
		e.preventDefault();
	});
	load_messages(window.msg_type, window.current_page);
	$("#btn-refresh").click(function(){
		load_messages(window.msg_type, window.current_page)
	});
});

/*
 * type is "incoming" or "sent"
 */
function load_messages(type, page){
	send_data = {
		type: type,
		page: page-1,
	};
	$.ajax({
		url: 'Messages?action=fetch',
		type: "POST",
		data: JSON.stringify(send_data),
		contentType: "application/json; charset=utf-8",
		dataType: 'json',
		success: function(data){
			$("#message-list-tbody").html("");
			$.each(data.messages, function(i, item){
				$("<td/>", {
					class: 'subject',
					html: $("<a/>",{
						href: "#",
						id: "message-link-" + item.id,
						class: item.read ? "read" : "unread",
						onclick: "show_msg(" + item.id + ")",
						text: item.subject
					})
				}).appendTo("#message-list-tbody");
				$("<tr/>",{
					html: $("<div/>",{
						text: item.body,
						class: "message-body",
						id: "message-body-" + item.id,
					}),
				}).appendTo("#message-list-tbody");
			});
			window.total_pages = data.pages;
			render_pages();
		}
			
	});
}

function show_msg(index){
	$(".message-body").hide(100);
	$("#message-body-" + index).toggle(100);
	if($("#message-link-" + index).hasClass("unread")){
		// Let server know we read this one.
		send_data = {
				message_id: index,
		};
		$.ajax({
			url: 'Messages?action=read',
			type: "POST",
			data: JSON.stringify(send_data),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(){
				console.log("Read");
			}
		});
		// Change the class of the url.
		$("#message-link-" + index).removeClass("unread");
		$("#message-link-" + index).addClass("read");
	}
}

function render_pages(){
	var html = "";
	for(var i = 1; i <= window.total_pages; i++){
		if(i == window.current_page){
			html += "<span>" + i + "</span> ";
		}
		else{
			html += "<a href='#' onclick='load_page(" + i +")'>" + i + " </a>";
		}
	}
	$("#pages").html(html);
}

function load_page(number){
	window.current_page = number;
	load_messages(window.msg_type, window.current_page);
}

function send_message(){
	obj = {
			'msg-to' : $("#msg-to").val(),
			'msg-subject' : $("#msg-subject").val(),
			'msg-body' : $("#msg-body").val()
	};
	$.ajax({
		url: "Messages?action=send",
		type: "POST",
		data: JSON.stringify(obj),
		contentType: "application/json; charset=utf-8",
		dataType: 'json',
		success: function(data){
			if(Boolean(data.success)){
				$("#message-form").hide(1000);
				$("#result").text(data.message);
			}
			else{
				$("#result").html("<span style='color: red'>" + data.message + "</span>");
				$(document).scrollTop($("#result").offset().top); // So user can see the message.
			}
		},
	});
}