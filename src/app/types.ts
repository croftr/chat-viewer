export type HangoutMessage = {
	author: string;
	message_id: string;
	created_date: string;
	text: string;
	topic_id: string;
};

export type FilteredHangoutMessage = {
	created_date: string;
	text: string;
	author: string;
};
