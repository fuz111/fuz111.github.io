function main() {
    const width = 1000, height = 1000;
    const svg = d3.select("#container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    svg.append("text")
        .attr("id","name")
        .attr("x",50)
        .attr("y",550)
        .text("Selected champion:")
    svg.append("g")
        .attr("id","bubble");
    svg.append("g")
        .attr("id","bar")
        .attr("transform", `translate(500,50)`)
        .append("text")
        .text("Total Wins & Loses")
        .attr("font-size", 20)
        .attr("x", 25)
        .attr("y", -20);
    let g = svg.append("g")
        .attr("id","pie")
        .attr("transform", `translate(300,400)`);
    g.append("text")
        .text("BLue Side Total Wins & Loses")
        .attr("font-size", 16)
        .attr("text-anchor", "middle")
        .attr("transform", `translate(250,50)`);
    g.append("text")
        .text("Red Side Total Wins & Loses")
        .attr("font-size", 16)
        .attr("text-anchor", "middle")
        .attr("transform", `translate(550,50)`);
    d3.csv("./wc_champions.csv").then(res => {
        drawBubble(res);
    })
}
function drawBubble(res) {
    let data = { name: "champions", children: res };
    let root = d3.hierarchy(data);
    root.sum(d => Math.max(0, d.sum_total));
    d3.pack()
        .size([500, 500])
        .padding(5)
        (root);
    const descendants = root.descendants();
   
    descendants.splice(0, 1);

    let g = d3.select("#bubble")
    const node = g.selectAll("g")
        .data(descendants)
        .join("g")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})`);

    node.append("circle")
        .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
        .attr("fill-opacity", 0.8)
        .attr("r", d => d.r)
        .style("cursor", "pointer")
        .on("mousemove", (e, d) => {
           
            d3.select(e.target)
                .attr("r", d.r + 2)
                .attr("fill-opacity", 1)
            d3.select("#tips")
                .style("display", "block")
                .style("left", e.clientX + 10 + "px")
                .style("top", e.clientY + 5 + "px")
                .html(
                    `champion: ${d.data.champion}
                             <br />
                             sum_total: ${d.data.sum_total}
                            `
                )
        })
        .on("mouseleave", (e, d) => {
            d3.select(e.target)
                .attr("r", d.r)
                .attr("fill-opacity", 0.8)
            d3.select("#tips")
                .style("display", "none")
        })
        .on("click",(e,d) => {
            drawBarChart(d.data);
            drawPieChart(d.data);
        })
    node.append("text")
        .attr("y", 5)
        .text(d => d.r >= 15 ? d.data.champion : '');
    drawBarChart(descendants[0].data);
    drawPieChart(descendants[0].data);
}
function drawBarChart(champion) {
    d3.select("#name").text("Selected champion:"+champion.champion);
    const width = 450, height = 350;
    const margin = {
        left: 50,
        top: 20,
        bottom: 20,
        right: 40
    }
    let g = d3.select("#bar");
    g.selectAll("g").remove();
    let x = d3.scaleBand()
        .domain(["lose_total", "win_total"])
        .range([margin.left, width - margin.left - margin.right])
        .padding(0.5);
    g.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
    let y = d3.scaleLinear()
        .domain([0, Math.max(champion.win_total, champion.lose_total)])
        .range([height - margin.bottom, margin.top]);
    g.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));
    g.append("g")
        .selectAll("rect")
        .data([{ ...champion, index: "win_total" }, { ...champion, index: "lose_total" }])
        .enter()
        .append("rect")
        .attr("x", d => x(d.index))
        .attr("y", y(0))
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", (d, i) => i == 0 ? "#1f77b4" : "#ff7f0e")
        .attr("fill-opacity", 0.8)
        .style("cursor", "pointer")
        .on("mousemove", (e, d) => {
            d3.select(e.target)
                .attr("r", d.r + 2)
                .attr("fill-opacity", 1)
            d3.select("#tips")
                .style("display", "block")
                .style("left", e.clientX + 10 + "px")
                .style("top", e.clientY + 5 + "px")
                .html(
                    `champion: ${d.champion}
                             <br />
                             ${d.index}: ${d[d.index]}
                            `
                )
        })
        .on("mouseleave", (e, d) => {
            d3.select(e.target)
                .attr("r", d.r)
                .attr("fill-opacity", 0.8)
            d3.select("#tips")
                .style("display", "none")
        })
        .transition()
        .attr("height", d => y(0) - y(d[d.index]))
        .attr("y", d => y(d[d.index]))


}
function drawPieChart(champion) {
    const width = 500, height = 400;
    const g = d3.select("#pie");
    g.selectAll("g")
        .remove();

    let blueData = [{ ...champion, index: "win_blue_side", number: champion.win_blue_side }, { ...champion, index: "lose_blue_side", number: champion.lose_blue_side }];
    let redData = [{ ...champion, index: "win_red_side", number: champion.win_red_side }, { ...champion, index: "lose_red_side", number: champion.lose_red_side }];
    console.log(d3.pie()(redData))
    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(120);
    let pie = d3.pie()
        .value(d => d.number)
        .sort(null);
    g.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`)
        .selectAll("path")
        .data(pie(redData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => d3.schemeCategory10[i])
        .attr("fill-opacity", 0.8)
        .style("cursor", "pointer")
        .on("mousemove", (e, d) => {
            d3.select(e.target)
                .attr("r", d.r + 2)
                .attr("fill-opacity", 1)
            d3.select("#tips")
                .style("display", "block")
                .style("left", e.clientX + 10 + "px")
                .style("top", e.clientY + 5 + "px")
                .html(
                    `champion: ${d.data.champion}
                             <br />
                             ${d.data.index}: ${d.data[d.data.index]}
                            `
                )
        })
        .on("mouseleave", (e, d) => {
            d3.select(e.target)
                .attr("r", d.r)
                .attr("fill-opacity", 0.8)
            d3.select("#tips")
                .style("display", "none")
        })

    arc.innerRadius(60)
        .padAngle(0.05)
    g.append("g")
        .attr("transform", `translate(${width / 2 + 300},${height / 2})`)
        .selectAll("path")
        .data(pie(blueData))
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => d3.schemeCategory10[i])
        .attr("fill-opacity", 0.8)
        .style("cursor", "pointer")
        .on("mousemove", (e, d) => {
            d3.select(e.target)
                .attr("r", d.r + 2)
                .attr("fill-opacity", 1)
            d3.select("#tips")
                .style("display", "block")
                .style("left", e.clientX + 10 + "px")
                .style("top", e.clientY + 5 + "px")
                .html(
                    `champion: ${d.data.champion}
                             <br />
                             ${d.data.index}: ${d.data[d.data.index]}
                            `
                )
        })
        .on("mouseleave", (e, d) => {
            d3.select(e.target)
                .attr("r", d.r)
                .attr("fill-opacity", 0.8)
            d3.select("#tips")
                .style("display", "none")
        })



}