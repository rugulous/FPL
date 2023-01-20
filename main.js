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

function willOfThePeople(team, elementTypes){
	const players = team.players.sort((a, b) => b.transfers_out_event - a.transfers_out_event);

	const mostTransferred = players[0];
	console.log(`Will of the people says sell ${mostTransferred.first_name} ${mostTransferred.second_name} [${elementTypes[mostTransferred.element_type - 1].singular_name_short}] (${mostTransferred.transfers_out_event} transferred out)`);

	for(let i = 0; i < players.length; i++){
		console.log(`${i + 1}. ${players[i].first_name} ${players[i].second_name} [${elementTypes[players[i].element_type - 1].singular_name_short}] (${players[i].transfers_out_event})`);
	}
}

async function main() {
	const { events, game_settings, phases, teams, total_players, elements, element_stats, element_types } = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/")
																																.then(res => res.json());

	const gameweek = getGameweek(events);
	const team = await getTeam(MANAGER_ID, gameweek.id, elements);

	willOfThePeople(JSON.parse(JSON.stringify(team)), element_types);
	
}

main();