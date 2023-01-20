const MANAGER_ID = 4687572;

function getGameweek(events){
	for(let i = 0; i < events.length; i++){
		if(events[i].is_current){
			return events[i];
		}
	}
}

async function getTeam(manager, week, elements){
	const url = `https://fantasy.premierleague.com/api/entry/${manager}/event/${week}/picks/`;

	const data = await fetch(url).then(res => res.json());

	const team = {
		players: [],
		bench: []
	};

	data.picks.forEach(p => {
		const match = elements.find(x => x.id == p.element);

		if(p.multiplier == 0){
			team.bench.push(match);
		} else {
			team.players.push(match);
		}
	});

	return team;
}

async function main() {
	const { events, game_settings, phases, teams, total_players, elements, element_stats, element_types } = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/")
																																.then(res => res.json());

	const gameweek = getGameweek(events);
	const team = await getTeam(MANAGER_ID, gameweek.id, elements);

	console.log(team);
}

main();