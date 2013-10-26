# `metrik`

Metrics aggregator for logfmt-style metrics

## `count`

Sums `count#` style metrics and includes other key=value pairs.

## `measure`

Planned support for mean, perc95, and perc99.

## Usage

  Try it out:

    > npm install -g metrik
    > cat logs.txt
    2013-10-25T20:19:41.739142+00:00 app[web.3]: count#vault_usage.http_201=1
    2013-10-25T20:19:41.739403+00:00 app[web.3]: count#vault_usage.http_2xx=1
    2013-10-25T20:19:41.739616+00:00 app[web.3]: measure#products_usage_events_close=0.070309922ms
    2013-10-25T20:19:41.799430+00:00 app[web.14]: count#vault_usage.http_201=1
    2013-10-25T20:19:41.799430+00:00 app[web.14]: count#vault_usage.http_2xx=1
    2013-10-25T20:19:41.799577+00:00 app[web.14]: measure#products_usage_events_open=0.010993464ms
    2013-10-25T20:19:41.826215+00:00 app[web.40]: count#vault_usage.http_201=1

    > cat logs.txt | metrik
    2013-10-25T20:19:41.739616+00:00 app[web.3]: measure#products_usage_events_close=0.070309922ms
    2013-10-25T20:19:41.799577+00:00 app[web.14]: measure#products_usage_events_open=0.010993464ms

    count#vault_usage.http_201=3
    count#vault_usage.http_2xx=2

  Use it on your dyno:

    web: bundle exec ruby app.rb | metrik
    worker: bin/worker | metrik
