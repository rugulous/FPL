const MANAGER_ID = 4687572;

function printMoney(money){
	money = (money / 10).toFixed(1);
	return `${money}m`;
}

function getSalePrice(player){
	return player.now_cost - 1;
}

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
		bench: [],
		bank: data.entry_history.bank
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

function willOfThePeople(team, elementTypes, elements){
	const players = team.players.sort((a, b) => b.transfers_out_event - a.transfers_out_event);

	const mostTransferredOut = players[0];
	const searchPos = mostTransferredOut.element_type;
	const salePrice = getSalePrice(mostTransferredOut);

	console.log(`Will of the people says sell ${mostTransferredOut.first_name} ${mostTransferredOut.second_name} [${elementTypes[mostTransferredOut.element_type - 1].singular_name_short}] (${mostTransferredOut.transfers_out_event} transferred out)`);

	for(let i = 0; i < players.length; i++){
		console.log(`${i + 1}. ${players[i].first_name} ${players[i].second_name} [${elementTypes[players[i].element_type - 1].singular_name_short}] (${players[i].transfers_out_event})`);
	}

	console.log();

	const bench = team.bench.sort((a, b) => b.transfers_in_event - a.transfers_in_event);
	const mostTransferredIn = bench[0];
	console.log(`Most transferred in bench player is ${mostTransferredIn.first_name} ${mostTransferredIn.second_name} [${elementTypes[mostTransferredIn.element_type - 1].singular_name_short}] (${mostTransferredIn.transfers_in_event} transferred in)`);

	if(mostTransferredIn.transfers_in_event >= mostTransferredOut.transfers_out_event){
		console.log("That's enough transfers to get in the team!");
		return mostTransferredIn;
	}

	console.log(`That's not enough transfers to get in. Looking for most transferred in ${elementTypes[searchPos - 1].singular_name}...`);
	
	const playerPool = elements.filter(x => x.element_type == searchPos && !players.some(p => p.id == x.id)).sort((a,b) => b.transfers_in_event - a.transfers_in_event);
	const totalBank = team.bank + salePrice;
	console.log(`Available funds: ${printMoney(team.bank)} (bank) + ${printMoney(salePrice)} (selling player) = ${printMoney(totalBank)}`);
	console.log();
	
	for(let i = 0; i < playerPool.length; i++){
		const player = playerPool[i];
		console.log(`${i + 1}. ${player.first_name} ${player.second_name} (${printMoney(player.now_cost)})`);

		if(player.now_cost <= totalBank){
			console.log("He's in our price range - let's go!");
			return player;
		}
	}
}

async function main() {
	const { events, game_settings, phases, teams, total_players, elements, element_stats, element_types } = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/")
																																.then(res => res.json());

	const gameweek = getGameweek(events);
	const team = await getTeam(MANAGER_ID, gameweek.id, elements);

	willOfThePeople(JSON.parse(JSON.stringify(team)), element_types, elements);
	
}

main();