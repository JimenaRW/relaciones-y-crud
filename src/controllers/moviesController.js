const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');


//Aqui tienen una forma de llamar a cada uno de los modelos
// const {Movies,Genres,Actor} = require('../database/models');

//Aquí tienen otra forma de llamar a los modelos creados
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll()
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
    },
    'detail': (req, res) => {
        db.Movie.findByPk(req.params.id)
            .then(movie => {
                res.render('moviesDetail.ejs', {movie});
            });
    },
    'new': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            });
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            where: {
                rating: {[db.Sequelize.Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            });
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: async function (req, res) {
        try {
            const genres = await Genres.findAll()
            return res.render('moviesAdd', { allGenres : genres })
        } catch (err) {
            console.log(err)
        }
    },
    create: async function (req,res) {
        try {
            const {title, rating, awards, release_date, length, genre_id} = req.body;

            const movie = await Movies.create({
                title, rating, awards, release_date, length, genre_id
            })

            return res.redirect('/movies')
        } catch (err) {
            console.log(err)
        }
    },
    edit: async function(req,res) {
        try {
            const movieId = req.params.id;
            const movies = await Movies.findByPk(movieId, {
                include : ['genre']
            })
            const genres = await Genres.findAll()

            movies.release_date = moment(new Date(movies.release_date)).format('L');

            return res.render('moviesEdit', {
                Movie : movies,
                allGenres : genres
            })
        } catch (error) {
            console.log(error)
        }
    },
    update: async function (req,res) {
        try {
            const movieId = req.params.id;
            const { title, rating, awards, release_date, length, genre_id } = req.body;
            const movies = await Movies.update({
                title, rating, awards, release_date, length, genre_id
            },
            { 
                where : {id : movieId}
            })

            return res.redirect('/movies')
        } catch (error) {
            console.log(error)
        }
    },
    delete: async function (req,res) {
        try {
            const movieId = req.params.id;
            const movies = await Movies.findByPk(movieId)

            return res.render('moviesDelete', { Movie : movies })
        } catch (error) {
            console.log(error)
        }
    },
    destroy: async function (req,res) {
        try {
            const movieId = req.params.id;
            const movies = await Movies.destroy({where : { id: movieId }, force : true})

            return res.redirect('/movies')
        } catch (error) {
            console.log(error)
        }    
    }
}

module.exports = moviesController;